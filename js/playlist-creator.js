// ============================================
// Playlist Creator — Spotify API Integration
// ============================================

import { getValidToken } from './spotify-auth.js';
import { sleep } from './utils.js';

const API_BASE = 'https://api.spotify.com/v1';

/** Make an authenticated API request with retry logic */
async function apiRequest(endpoint, options = {}, retries = 3) {
  const token = await getValidToken();
  if (!token) throw new Error('Not authenticated');

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
      const waitTime = retryAfter * 1000 * (attempt + 1); // Exponential
      console.warn(`Rate limited. Waiting ${retryAfter}s (attempt ${attempt + 1})`);
      if (options.onRateLimit) {
        options.onRateLimit(retryAfter);
      }
      await sleep(waitTime);
      continue;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${err.error?.message || 'Unknown error'}`);
    }

    // 201 Created for playlist creation, 201 for adding items
    if (response.status === 204) return null;
    return await response.json();
  }

  throw new Error('Max retries exceeded due to rate limiting');
}

/** Get current user's profile */
export async function getUserProfile() {
  return await apiRequest('/me');
}

/** Create a new playlist for the current user */
export async function createPlaylist(name, description = '', isPublic = true) {
  // Using the new /me/playlists endpoint (2026 update)
  return await apiRequest('/me/playlists', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      public: isPublic
    })
  });
}

/** Search for a track by name and artist (fallback for missing URIs) */
export async function searchTrack(trackName, artistName) {
  const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
  const data = await apiRequest(`/search?q=${query}&type=track&limit=1`);
  
  if (data.tracks?.items?.length > 0) {
    return data.tracks.items[0].uri;
  }
  return null;
}

/**
 * Add items to a playlist in batches
 * Uses the new /playlists/{id}/items endpoint (2026)
 * Max 100 items per request
 */
export async function addItemsToPlaylist(playlistId, uris, onProgress = null) {
  const BATCH_SIZE = 100;
  let added = 0;
  let failed = 0;
  const totalBatches = Math.ceil(uris.length / BATCH_SIZE);

  for (let i = 0; i < uris.length; i += BATCH_SIZE) {
    const batch = uris.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    try {
      // Using the new /items endpoint (not /tracks which is deprecated)
      await apiRequest(`/playlists/${playlistId}/items`, {
        method: 'POST',
        body: JSON.stringify({ uris: batch }),
        onRateLimit: (seconds) => {
          if (onProgress) {
            onProgress({ type: 'rateLimit', seconds, added, failed, total: uris.length });
          }
        }
      });

      added += batch.length;

      if (onProgress) {
        onProgress({
          type: 'progress',
          added,
          failed,
          total: uris.length,
          batch: batchNum,
          totalBatches
        });
      }

      // Small delay between batches to be nice to the API
      if (i + BATCH_SIZE < uris.length) {
        await sleep(200);
      }

    } catch (err) {
      console.error(`Batch ${batchNum} failed:`, err);
      failed += batch.length;

      if (onProgress) {
        onProgress({
          type: 'error',
          added,
          failed,
          total: uris.length,
          error: err.message,
          batch: batchNum,
          totalBatches
        });
      }
    }
  }

  return { added, failed, total: uris.length };
}

/**
 * Resolve track URIs: use existing URIs when available,
 * search for tracks when URI is null
 */
export async function resolveTrackUris(tracks, onProgress = null) {
  const resolved = [];
  const missing = [];
  let searchCount = 0;

  // First pass: collect all known URIs
  for (const track of tracks) {
    if (track.spotifyUri) {
      resolved.push(track.spotifyUri);
    } else {
      missing.push(track);
    }
  }

  // Second pass: search for missing URIs (with rate limiting awareness)
  for (const track of missing) {
    try {
      const uri = await searchTrack(track.trackName, track.artistName);
      if (uri) {
        resolved.push(uri);
      }
      searchCount++;

      if (onProgress) {
        onProgress({
          type: 'resolving',
          resolved: resolved.length,
          total: tracks.length,
          searching: searchCount,
          totalMissing: missing.length
        });
      }

      // Rate limit: 1 search per 100ms
      await sleep(100);

    } catch (err) {
      console.warn(`Could not find: ${track.trackName} — ${track.artistName}`);
    }
  }

  return resolved;
}

/**
 * Full playlist creation pipeline
 */
export async function createFullPlaylist(tracks, name, description, onProgress) {
  // Step 1: Resolve URIs
  onProgress({ type: 'status', message: 'Resolving track URIs...' });
  const uris = await resolveTrackUris(tracks, onProgress);

  if (uris.length === 0) {
    throw new Error('No tracks with valid URIs found');
  }

  // Step 2: Create the playlist
  onProgress({ type: 'status', message: 'Creating playlist...' });
  const playlist = await createPlaylist(name, description);

  // Step 3: Add tracks
  onProgress({ type: 'status', message: 'Adding tracks...' });
  const result = await addItemsToPlaylist(playlist.id, uris, onProgress);

  return {
    ...result,
    playlistId: playlist.id,
    playlistUrl: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
    playlistName: name
  };
}
