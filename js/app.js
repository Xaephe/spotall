// ============================================
// App — Ana Koordinatör
// ============================================

import { detectLanguage, setLanguage, getLang, t, getLanguages } from './i18n.js';
import { formatDuration, formatDurationShort, formatNumber, debounce, showToast, escapeHtml } from './utils.js';
import { redirectToSpotifyAuth, handleCallback, isAuthenticated, getValidToken } from './spotify-auth.js';
import { parseStreamingHistory, aggregateTracks, sortByPlayCount, getTopN, getStats } from './data-processor.js';
import { getUserProfile, createFullPlaylist } from './playlist-creator.js';
import { saveToStorage, loadFromStorage, removeFromStorage } from './storage.js';

// ─── State ───
const state = {
  currentStep: 1,
  files: [],
  rawEntries: [],
  tracks: [],       // aggregated & sorted
  selectedCount: 1000,
  isProcessing: false,
  displayedRows: 0,
  searchQuery: ''
};

const ROWS_PER_LOAD = 50;

// ─── Init ───
document.addEventListener('DOMContentLoaded', async () => {
  detectLanguage();
  applyTranslations();
  renderLanguageSelector();
  initBgParticles();
  bindEvents();

  // Handle OAuth callback
  const params = new URLSearchParams(window.location.search);
  if (params.has('code')) {
    try {
      const success = await handleCallback();
      if (success) {
        showToast(t('toastConnected'), 'success');
        // Restore state from sessionStorage if available
        restoreState();
        updateAuthUI();
      }
    } catch (err) {
      showToast(t('toastError', { msg: err.message }), 'error');
    }
  }

  if (isAuthenticated()) {
    updateAuthUI();
  }
});

// ─── Apply translations to all [data-i18n] elements ───
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, t(key));
    } else {
      el.innerHTML = t(key);
    }
  });
  document.documentElement.lang = getLang();
}

// ─── Language selector ───
function renderLanguageSelector() {
  const container = document.getElementById('langSelector');
  if (!container) return;

  const langs = getLanguages();
  container.innerHTML = '';

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = `lang-btn ${getLang() === lang.code ? 'active' : ''}`;
    btn.textContent = `${lang.flag} ${lang.name}`;
    btn.onclick = () => {
      setLanguage(lang.code);
      applyTranslations();
      renderLanguageSelector();
      // Re-render dynamic content
      if (state.tracks.length > 0) {
        renderStats();
        renderSongsTable();
      }
    };
    container.appendChild(btn);
  });
}

// ─── Background particles ───
function initBgParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.width = `${2 + Math.random() * 4}px`;
    particle.style.height = particle.style.width;
    particle.style.animationDelay = `${Math.random() * 20}s`;
    particle.style.animationDuration = `${15 + Math.random() * 15}s`;
    container.appendChild(particle);
  }
}

// ─── Event Binding ───
function bindEvents() {
  // File upload
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');

  browseBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', handleFileSelect);

  uploadZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone?.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });
  uploadZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFileSelect({ target: { files: e.dataTransfer.files } });
  });

  // Analyze button
  document.getElementById('analyzeBtn')?.addEventListener('click', analyzeData);

  // Navigation
  document.getElementById('backToStep1')?.addEventListener('click', () => goToStep(1));
  document.getElementById('goToStep3')?.addEventListener('click', () => goToStep(3));
  document.getElementById('backToStep2')?.addEventListener('click', () => goToStep(2));
  document.getElementById('goToStep4')?.addEventListener('click', async () => {
    await saveState();
    goToStep(4);
  });
  document.getElementById('backToStep3')?.addEventListener('click', () => goToStep(3));
  document.getElementById('startOverBtn')?.addEventListener('click', startOver);

  // Song count selection
  document.getElementById('countOptions')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.count-btn');
    if (!btn) return;
    
    document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const count = btn.dataset.count;
    const customInput = document.getElementById('customCount');
    
    if (count === 'custom') {
      customInput.style.display = 'block';
      const input = document.getElementById('customCountInput');
      input.focus();
      if (input.value) state.selectedCount = parseInt(input.value);
    } else {
      customInput.style.display = 'none';
      state.selectedCount = parseInt(count);
    }
  });

  document.getElementById('customCountInput')?.addEventListener('input', (e) => {
    state.selectedCount = parseInt(e.target.value) || 100;
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('input', debounce((e) => {
    state.searchQuery = e.target.value.toLowerCase();
    state.displayedRows = 0;
    renderSongsTable();
  }, 200));

  // Load more
  document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreSongs);

  // Spotify connect
  document.getElementById('connectSpotifyBtn')?.addEventListener('click', async () => {
    await saveState();
    redirectToSpotifyAuth();
  });
}

// ─── File handling ───
function handleFileSelect(e) {
  const newFiles = Array.from(e.target.files || []);
  const validFiles = newFiles.filter(f => f.name.endsWith('.json') || f.name.endsWith('.zip'));

  if (validFiles.length === 0) {
    showToast(t('toastError', { msg: 'Please select .json or .zip files' }), 'error');
    return;
  }

  state.files.push(...validFiles);
  renderFileList();
  showToast(t('toastFilesLoaded', { count: validFiles.length }), 'success');
}

function renderFileList() {
  const container = document.getElementById('uploadedFiles');
  const list = document.getElementById('fileList');
  if (!container || !list) return;

  container.style.display = 'block';
  list.innerHTML = state.files.map((f, i) => `
    <div class="file-item">
      <div class="file-icon">${f.name.endsWith('.zip') ? '📦' : '📄'}</div>
      <div class="file-info">
        <span class="file-name">${escapeHtml(f.name)}</span>
        <span class="file-size">${(f.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
      <button class="file-remove" data-index="${i}" title="Remove">✕</button>
    </div>
  `).join('');

  // Remove file handlers
  list.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.files.splice(parseInt(btn.dataset.index), 1);
      renderFileList();
      if (state.files.length === 0) container.style.display = 'none';
    });
  });
}

// ─── Data analysis ───
async function analyzeData() {
  if (state.files.length === 0) return;
  if (state.isProcessing) return;
  state.isProcessing = true;

  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = `<span class="spinner"></span> ${t('toastAnalyzing')}`;

  try {
    showToast(t('toastAnalyzing'), 'info');

    // Parse files
    state.rawEntries = await parseStreamingHistory(state.files);

    // Get filter options
    const filterShortPlays = document.getElementById('filterShortPlays')?.checked ?? true;
    const filterSkips = document.getElementById('filterSkips')?.checked ?? false;

    // Aggregate and sort
    const aggregated = aggregateTracks(state.rawEntries, { filterShortPlays, filterSkips });
    state.tracks = sortByPlayCount(aggregated);

    showToast(t('toastAnalyzed', { count: formatNumber(state.tracks.length) }), 'success');

    // Update UI
    renderStats();
    state.displayedRows = 0;
    renderSongsTable();
    updateAvailableCount();
    goToStep(2);

  } catch (err) {
    showToast(t('toastError', { msg: err.message }), 'error');
    console.error(err);
  } finally {
    state.isProcessing = false;
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = `<span>${t('analyzeBtn')}</span>
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }
}

function renderStats() {
  const stats = getStats(state.tracks);

  animateValue('statTotalSongs', stats.totalUnique);
  animateValue('statTotalPlays', stats.totalPlays);
  document.getElementById('statTotalTime').textContent = formatDuration(stats.totalMs);
  document.getElementById('statTopArtist').textContent = stats.topArtist;
}

function animateValue(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  const duration = 800;
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(startVal + (target - startVal) * eased);
    el.textContent = formatNumber(current);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ─── Songs Table ───
function renderSongsTable() {
  const tbody = document.getElementById('songsTableBody');
  if (!tbody) return;

  let filtered = state.tracks;
  if (state.searchQuery) {
    filtered = state.tracks.filter(t =>
      t.trackName.toLowerCase().includes(state.searchQuery) ||
      t.artistName.toLowerCase().includes(state.searchQuery)
    );
  }

  const toShow = filtered.slice(0, state.displayedRows + ROWS_PER_LOAD);
  state.displayedRows = toShow.length;

  tbody.innerHTML = toShow.map((track, i) => `
    <tr>
      <td class="col-rank">
        <span class="rank ${i < 3 ? 'rank-top' : ''}">${i + 1}</span>
      </td>
      <td class="col-song">${escapeHtml(track.trackName)}</td>
      <td class="col-artist">${escapeHtml(track.artistName)}</td>
      <td class="col-plays">${formatNumber(track.playCount)}</td>
      <td class="col-time">${formatDurationShort(track.totalMsPlayed)}</td>
    </tr>
  `).join('');

  // Update count
  const countEl = document.getElementById('showingCount');
  if (countEl) {
    countEl.textContent = t('showingCount', { count: `${formatNumber(toShow.length)} / ${formatNumber(filtered.length)}` });
  }

  // Show/hide load more
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = toShow.length < filtered.length ? 'block' : 'none';
  }
}

function loadMoreSongs() {
  const tbody = document.getElementById('songsTableBody');
  if (!tbody) return;

  let filtered = state.tracks;
  if (state.searchQuery) {
    filtered = state.tracks.filter(t =>
      t.trackName.toLowerCase().includes(state.searchQuery) ||
      t.artistName.toLowerCase().includes(state.searchQuery)
    );
  }

  const start = state.displayedRows;
  const newItems = filtered.slice(start, start + ROWS_PER_LOAD);
  state.displayedRows += newItems.length;

  const fragment = document.createDocumentFragment();
  newItems.forEach((track, i) => {
    const row = document.createElement('tr');
    const rank = start + i + 1;
    row.innerHTML = `
      <td class="col-rank"><span class="rank">${rank}</span></td>
      <td class="col-song">${escapeHtml(track.trackName)}</td>
      <td class="col-artist">${escapeHtml(track.artistName)}</td>
      <td class="col-plays">${formatNumber(track.playCount)}</td>
      <td class="col-time">${formatDurationShort(track.totalMsPlayed)}</td>
    `;
    fragment.appendChild(row);
  });
  tbody.appendChild(fragment);

  // Update count
  const countEl = document.getElementById('showingCount');
  if (countEl) {
    countEl.textContent = t('showingCount', { count: `${formatNumber(state.displayedRows)} / ${formatNumber(filtered.length)}` });
  }

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = state.displayedRows < filtered.length ? 'block' : 'none';
  }
}

function updateAvailableCount() {
  const el = document.getElementById('availableCount');
  if (el) el.textContent = formatNumber(state.tracks.length);
}

// ─── Wizard Navigation ───
function goToStep(step) {
  state.currentStep = step;

  // Update step sections
  document.querySelectorAll('.wizard-step').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(`step${step}`)?.classList.add('active');

  // Update progress steps
  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (s === step) el.classList.add('active');
    if (s < step) el.classList.add('completed');
  });

  // Update progress bar
  const fill = document.getElementById('progressFill');
  if (fill) {
    fill.style.width = `${((step - 1) / 3) * 100}%`;
  }

  // If step 4, check auth and maybe auto-start
  if (step === 4 && isAuthenticated()) {
    startPlaylistCreation();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Auth UI ───
async function updateAuthUI() {
  try {
    const profile = await getUserProfile();
    const userInfo = document.getElementById('userInfo');
    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');

    if (userInfo && profile) {
      userInfo.style.display = 'flex';
      if (avatar && profile.images?.[0]) {
        avatar.src = profile.images[0].url;
      }
      if (name) name.textContent = profile.display_name;
    }
  } catch (err) {
    console.warn('Could not fetch user profile:', err);
  }
}

// ─── Playlist Creation ───
async function startPlaylistCreation() {
  const connectCard = document.getElementById('connectCard');
  const creationCard = document.getElementById('creationCard');
  const successCard = document.getElementById('successCard');
  const step4Actions = document.getElementById('step4Actions');

  if (connectCard) connectCard.style.display = 'none';
  if (creationCard) creationCard.style.display = 'block';
  if (successCard) successCard.style.display = 'none';
  if (step4Actions) step4Actions.style.display = 'none';

  const playlistName = document.getElementById('playlistName')?.value || t('playlistNameDefault');
  const playlistDesc = document.getElementById('playlistDesc')?.value || '';
  const selectedTracks = getTopN(state.tracks, state.selectedCount);

  const totalEl = document.getElementById('totalToAdd');
  if (totalEl) totalEl.textContent = formatNumber(selectedTracks.length);

  try {
    const result = await createFullPlaylist(
      selectedTracks,
      playlistName,
      playlistDesc,
      (progress) => updateCreationProgress(progress)
    );

    // Success!
    if (creationCard) creationCard.style.display = 'none';
    if (successCard) successCard.style.display = 'block';

    const successMsg = document.getElementById('successMessage');
    if (successMsg) successMsg.textContent = t('successMsg', { added: formatNumber(result.added) });

    const openBtn = document.getElementById('openPlaylistBtn');
    if (openBtn) openBtn.href = result.playlistUrl;

    showToast(t('toastPlaylistCreated'), 'success');

  } catch (err) {
    showToast(t('toastError', { msg: err.message }), 'error');
    if (step4Actions) step4Actions.style.display = 'flex';
    addLog(`❌ Error: ${err.message}`, 'error');
  }
}

function updateCreationProgress(progress) {
  const addedEl = document.getElementById('addedCount');
  const failedEl = document.getElementById('failedCount');
  const percentEl = document.getElementById('progressPercent');
  const ringEl = document.getElementById('progressRing');
  const titleEl = document.getElementById('creationTitle');
  const subEl = document.getElementById('creationSubtitle');

  if (progress.type === 'progress' || progress.type === 'resolving') {
    const total = progress.total || 1;
    const done = progress.added || progress.resolved || 0;
    const pct = Math.round((done / total) * 100);

    if (addedEl) addedEl.textContent = formatNumber(done);
    if (failedEl) failedEl.textContent = formatNumber(progress.failed || 0);
    if (percentEl) percentEl.textContent = `${pct}%`;

    // SVG ring progress
    if (ringEl) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (pct / 100) * circumference;
      ringEl.style.strokeDasharray = `${circumference}`;
      ringEl.style.strokeDashoffset = `${offset}`;
    }
  }

  if (progress.type === 'status') {
    if (subEl) subEl.textContent = progress.message;
    addLog(`ℹ️ ${progress.message}`);
  }

  if (progress.type === 'rateLimit') {
    addLog(`⏳ Rate limit — ${t('toastRateLimit', { seconds: progress.seconds })}`, 'warning');
    showToast(t('toastRateLimit', { seconds: progress.seconds }), 'warning');
  }

  if (progress.type === 'error') {
    addLog(`❌ Batch ${progress.batch} failed: ${progress.error}`, 'error');
  }

  if (progress.type === 'progress' && progress.batch) {
    addLog(`✅ Batch ${progress.batch}/${progress.totalBatches} — ${formatNumber(progress.added)} added`);
  }
}

function addLog(message, type = 'info') {
  const log = document.getElementById('creationLog');
  if (!log) return;

  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.textContent = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// ─── State persistence (survive OAuth redirect) ───
// Using IndexedDB instead of sessionStorage to handle large datasets (5000+ tracks)
async function saveState() {
  try {
    // Only save the selected tracks (top N) to minimize storage size
    const selectedTracks = getTopN(state.tracks, state.selectedCount);

    const stateToSave = {
      // Save only essential fields per track to reduce size
      tracks: selectedTracks.map(t => ({
        trackName: t.trackName,
        artistName: t.artistName,
        spotifyUri: t.spotifyUri,
        playCount: t.playCount,
        totalMsPlayed: t.totalMsPlayed
      })),
      selectedCount: state.selectedCount,
      playlistName: document.getElementById('playlistName')?.value,
      playlistDesc: document.getElementById('playlistDesc')?.value,
      currentStep: 4
    };

    await saveToStorage('app_state', stateToSave);
    console.log(`State saved: ${selectedTracks.length} tracks to IndexedDB`);
  } catch (e) {
    console.error('Failed to save state:', e);
    // Fallback: try sessionStorage with minimal data
    try {
      const minimal = {
        selectedCount: state.selectedCount,
        playlistName: document.getElementById('playlistName')?.value,
        playlistDesc: document.getElementById('playlistDesc')?.value,
        currentStep: 4,
        trackUris: getTopN(state.tracks, state.selectedCount)
          .filter(t => t.spotifyUri)
          .map(t => t.spotifyUri)
      };
      sessionStorage.setItem('app_state_minimal', JSON.stringify(minimal));
    } catch (e2) {
      console.error('Fallback save also failed:', e2);
    }
  }
}

async function restoreState() {
  try {
    // Try IndexedDB first
    let parsed = await loadFromStorage('app_state');

    // Fallback to sessionStorage
    if (!parsed) {
      const minimal = sessionStorage.getItem('app_state_minimal');
      if (minimal) {
        parsed = JSON.parse(minimal);
        sessionStorage.removeItem('app_state_minimal');
      }
    }

    if (!parsed) return;

    state.tracks = parsed.tracks || [];
    state.selectedCount = parsed.selectedCount || 1000;

    // If we only have URIs (from minimal fallback), reconstruct tracks
    if (parsed.trackUris && state.tracks.length === 0) {
      state.tracks = parsed.trackUris.map((uri, i) => ({
        trackName: `Track ${i + 1}`,
        artistName: 'Unknown',
        spotifyUri: uri,
        playCount: 0,
        totalMsPlayed: 0
      }));
    }

    if (parsed.playlistName) {
      const nameInput = document.getElementById('playlistName');
      if (nameInput) nameInput.value = parsed.playlistName;
    }
    if (parsed.playlistDesc) {
      const descInput = document.getElementById('playlistDesc');
      if (descInput) descInput.value = parsed.playlistDesc;
    }

    console.log(`State restored: ${state.tracks.length} tracks from storage`);

    if (state.tracks.length > 0 && parsed.currentStep === 4) {
      goToStep(4);
    }

    // Cleanup
    await removeFromStorage('app_state');
  } catch (e) {
    console.warn('Could not restore state:', e);
  }
}

function startOver() {
  state.files = [];
  state.rawEntries = [];
  state.tracks = [];
  state.displayedRows = 0;
  state.searchQuery = '';
  state.currentStep = 1;

  // Reset UI
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.value = '';
  document.getElementById('uploadedFiles').style.display = 'none';
  document.getElementById('connectCard').style.display = 'block';
  document.getElementById('creationCard').style.display = 'none';
  document.getElementById('successCard').style.display = 'none';
  document.getElementById('step4Actions').style.display = 'flex';
  document.getElementById('creationLog').innerHTML = '';

  goToStep(1);
}
