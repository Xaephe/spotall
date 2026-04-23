// ============================================
// Data Processor — JSON/ZIP Parsing & Analysis
// ============================================

// JSZip loaded from CDN in index.html

/**
 * Parse streaming history from uploaded files
 * Supports both .json files and .zip archives
 */
export async function parseStreamingHistory(files) {
  let allEntries = [];

  for (const file of files) {
    let entries;
    if (file.name.endsWith('.zip')) {
      entries = await parseZipFile(file);
    } else if (file.name.endsWith('.json')) {
      entries = await parseJsonFile(file);
    }
    if (entries && entries.length > 0) {
      // Use concat instead of push(...) to avoid "Maximum call stack size exceeded"
      // with very large arrays (100k+ entries)
      allEntries = allEntries.concat(entries);
    }
  }

  console.log(`Parsed ${allEntries.length} total entries from ${files.length} files`);
  return allEntries;
}

/** Parse a single JSON file */
async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          resolve(data);
        } else {
          resolve([]);
        }
      } catch (err) {
        reject(new Error(`Failed to parse ${file.name}: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

/** Parse a ZIP file and extract JSON files from it */
async function parseZipFile(file) {
  if (typeof JSZip === 'undefined') {
    throw new Error('JSZip library not loaded');
  }

  const zip = await JSZip.loadAsync(file);
  let entries = [];

  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    // Only process audio streaming history JSON files
    if (filename.endsWith('.json') && 
        (filename.includes('Audio') || filename.includes('audio') || filename.includes('Streaming_History'))) {
      const content = await zipEntry.async('text');
      try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          // Use concat to avoid call stack overflow with large arrays
          entries = entries.concat(data);
          console.log(`  ${filename}: ${data.length} entries`);
        }
      } catch (e) {
        console.warn(`Skipping ${filename}: not valid JSON`);
      }
    }
  }

  return entries;
}

/**
 * Aggregate track plays from raw streaming entries
 * Groups by spotify_track_uri (primary) or track_name+artist_name (fallback)
 */
export function aggregateTracks(entries, options = {}) {
  const { filterShortPlays = true, filterSkips = false, minPlayMs = 30000 } = options;
  const trackMap = new Map();

  for (const entry of entries) {
    // Skip podcast episodes
    if (entry.episode_name || entry.spotify_episode_uri) continue;

    // Skip if no track info
    const trackName = entry.master_metadata_track_name;
    const artistName = entry.master_metadata_album_artist_name;
    if (!trackName) continue;

    const msPlayed = entry.ms_played || 0;

    // Optional filters
    if (filterShortPlays && msPlayed < minPlayMs) continue;
    if (filterSkips && entry.skipped === true) continue;

    // Create a unique key for grouping
    const uri = entry.spotify_track_uri || null;
    const key = uri || `${trackName}|||${artistName}`;

    if (trackMap.has(key)) {
      const existing = trackMap.get(key);
      existing.playCount++;
      existing.totalMsPlayed += msPlayed;
      if (entry.ts && entry.ts > existing.lastPlayed) {
        existing.lastPlayed = entry.ts;
      }
    } else {
      trackMap.set(key, {
        trackName: trackName,
        artistName: artistName || 'Unknown Artist',
        albumName: entry.master_metadata_album_album_name || '',
        spotifyUri: uri,
        playCount: 1,
        totalMsPlayed: msPlayed,
        lastPlayed: entry.ts || ''
      });
    }
  }

  return Array.from(trackMap.values());
}

/** Sort tracks by play count, descending */
export function sortByPlayCount(tracks) {
  return tracks.sort((a, b) => {
    if (b.playCount !== a.playCount) return b.playCount - a.playCount;
    return b.totalMsPlayed - a.totalMsPlayed; // Tiebreaker: total time
  });
}

/** Get the top N tracks */
export function getTopN(tracks, n) {
  return tracks.slice(0, Math.min(n, tracks.length));
}

/** Calculate stats from aggregated tracks */
export function getStats(tracks, allEntries = []) {
  const totalUnique = tracks.length;
  const totalPlays = tracks.reduce((sum, t) => sum + t.playCount, 0);
  const totalMs = tracks.reduce((sum, t) => sum + t.totalMsPlayed, 0);

  // Top artist by play count
  const artistMap = new Map();
  for (const track of tracks) {
    const artist = track.artistName;
    artistMap.set(artist, (artistMap.get(artist) || 0) + track.playCount);
  }

  let topArtist = '-';
  let maxPlays = 0;
  for (const [artist, plays] of artistMap) {
    if (plays > maxPlays) {
      maxPlays = plays;
      topArtist = artist;
    }
  }

  return {
    totalUnique,
    totalPlays,
    totalMs,
    topArtist,
    topArtistPlays: maxPlays
  };
}
