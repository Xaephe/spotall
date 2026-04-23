// ============================================
// Spotify Auth — OAuth 2.0 PKCE Flow
// ============================================

const CLIENT_ID = '10e031bca5fc4402889fd99d1c50c5fa';
const SCOPES = 'playlist-modify-public playlist-modify-private user-read-private';
const TOKEN_KEY = 'spotify_token_data';
const VERIFIER_KEY = 'spotify_code_verifier';
const STATE_KEY = 'spotify_auth_state';

/** Get the redirect URI based on current environment */
function getRedirectUri() {
  const origin = window.location.origin;
  return `${origin}/callback`;
}

/** Generate a cryptographically random string */
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

/** SHA-256 hash */
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

/** Base64 URL encode */
function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach(b => str += String.fromCharCode(b));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Generate code challenge from verifier */
async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

/** Redirect user to Spotify authorization page */
export async function redirectToSpotifyAuth() {
  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);
  const state = generateRandomString(16);

  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state: state
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/** Handle OAuth callback — exchange code for tokens */
export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    throw new Error(`Spotify auth error: ${error}`);
  }

  if (!code) return false;

  // Verify state
  const savedState = sessionStorage.getItem(STATE_KEY);
  if (state !== savedState) {
    throw new Error('State mismatch — possible CSRF attack');
  }

  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) {
    throw new Error('Code verifier not found');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: getRedirectUri(),
      client_id: CLIENT_ID,
      code_verifier: verifier
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Token exchange failed: ${err.error_description || response.status}`);
  }

  const data = await response.json();

  // Store token data with expiry timestamp
  const tokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000 // 1 min buffer
  };
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));

  // Cleanup
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  // Remove code from URL
  window.history.replaceState({}, document.title, window.location.pathname);

  return true;
}

/** Refresh the access token */
async function refreshAccessToken() {
  const tokenData = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || '{}');
  if (!tokenData.refresh_token) {
    throw new Error('No refresh token available');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
      client_id: CLIENT_ID
    })
  });

  if (!response.ok) {
    sessionStorage.removeItem(TOKEN_KEY);
    throw new Error('Token refresh failed — please reconnect');
  }

  const data = await response.json();
  const newTokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || tokenData.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000
  };
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(newTokenData));
  return newTokenData.access_token;
}

/** Get a valid access token, refreshing if necessary */
export async function getValidToken() {
  const tokenData = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || '{}');
  if (!tokenData.access_token) return null;

  if (Date.now() >= tokenData.expires_at) {
    return await refreshAccessToken();
  }

  return tokenData.access_token;
}

/** Check if user is authenticated */
export function isAuthenticated() {
  const tokenData = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || '{}');
  return !!tokenData.access_token;
}

/** Logout — clear tokens */
export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
}
