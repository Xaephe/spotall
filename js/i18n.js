// ============================================
// i18n — Multi-language Support
// ============================================

const translations = {
  tr: {
    // Header
    appName: 'SpotAll',
    
    // Steps
    step1Label: 'Veri Yükle',
    step2Label: 'Analiz Et',
    step3Label: 'Seçim Yap',
    step4Label: 'Playlist Oluştur',

    // Step 1
    step1Title: 'Spotify Dinleme Verini Yükle',
    step1Desc: 'Spotify\'dan indirdiğin <strong>Extended Streaming History</strong> JSON dosyalarını buraya yükle.',
    howToTitle: 'Veri nasıl indirilir?',
    howToStep1: '<a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener">Spotify Gizlilik Ayarları</a> sayfasına git',
    howToStep2: '"Extended streaming history" seçeneğini işaretle',
    howToStep3: '"Request data" butonuna tıkla',
    howToStep4: 'Spotify 5-30 gün içinde verilerini e-posta ile gönderecek',
    howToStep5: 'ZIP dosyasını veya içindeki JSON dosyalarını buraya yükle',
    uploadDragText: 'JSON veya ZIP dosyalarını sürükle & bırak',
    uploadOr: 'veya',
    uploadBrowse: 'Dosya Seç',
    uploadedFilesTitle: 'Yüklenen Dosyalar',
    analyzeBtn: 'Analiz Et',

    // Step 2
    step2Title: 'Dinleme Analizi',
    step2Desc: 'Tüm dinleme geçmişin analiz edildi! İşte sonuçlar:',
    statUniqueSongs: 'Farklı Şarkı',
    statTotalPlays: 'Toplam Dinleme',
    statTotalTime: 'Toplam Süre',
    statTopArtist: 'En Çok Dinlenen Sanatçı',
    topSongsTitle: '🏆 En Çok Dinlenen Şarkılar',
    searchPlaceholder: 'Şarkı veya sanatçı ara...',
    colRank: '#',
    colSong: 'Şarkı',
    colArtist: 'Sanatçı',
    colPlays: 'Dinlenme',
    colTime: 'Süre',
    showingCount: '{count} şarkı gösteriliyor',
    loadMore: 'Daha Fazla Göster',
    backBtn: 'Geri',
    playlistSettingsBtn: 'Playlist Ayarları',

    // Step 3
    step3Title: 'Playlist Ayarları',
    step3Desc: 'Kaç şarkı dahil etmek istediğini ve playlist adını belirle.',
    songCountLabel: 'Şarkı Sayısı',
    customLabel: 'Özel',
    customPlaceholder: 'Şarkı sayısı gir...',
    availableHint: 'Mevcut: {count} farklı şarkı',
    playlistNameLabel: 'Playlist Adı',
    playlistNameDefault: 'My Top Songs — All Time',
    playlistDescLabel: 'Playlist Açıklaması',
    playlistDescDefault: 'En çok dinlediğim şarkılar, dinlenme sayısına göre sıralanmış.',
    filtersLabel: 'Filtreler',
    filterShortPlays: '30 saniyeden kısa dinlemeleri sayma',
    filterSkips: 'Atlanan (skip) şarkıları sayma',
    createPlaylistBtn: 'Playlist Oluştur',

    // Step 4
    step4Title: 'Playlist Oluştur',
    step4Desc: 'Spotify hesabına bağlan ve playlist\'ini oluştur!',
    connectTitle: 'Spotify\'a Bağlan',
    connectDesc: 'Playlist oluşturmak için Spotify hesabına giriş yap. Sadece playlist oluşturma izni isteyeceğiz.',
    connectBtn: 'Spotify ile Bağlan',
    creatingTitle: 'Playlist oluşturuluyor...',
    creatingSub: 'Şarkılar Spotify\'a ekleniyor',
    addedLabel: 'Eklenen',
    totalLabel: 'Toplam',
    failedLabel: 'Başarısız',
    successTitle: '🎉 Playlist Oluşturuldu!',
    successMsg: '{added} şarkı başarıyla playlist\'e eklendi.',
    openInSpotify: 'Spotify\'da Aç',
    startOver: 'Baştan Başla',

    // Footer
    footerText: 'Verileriniz tamamen tarayıcınızda işlenir, hiçbir sunucuya gönderilmez.',

    // Toasts
    toastFilesLoaded: '{count} dosya yüklendi',
    toastAnalyzing: 'Veriler analiz ediliyor...',
    toastAnalyzed: '{count} farklı şarkı bulundu!',
    toastError: 'Bir hata oluştu: {msg}',
    toastConnected: 'Spotify\'a bağlandı!',
    toastPlaylistCreated: 'Playlist başarıyla oluşturuldu!',
    toastNoTracks: 'URI\'si olan şarkı bulunamadı.',
    toastRateLimit: 'Rate limit — {seconds}s bekleniyor...',

    // Time
    hours: 'saat',
    minutes: 'dk',
    days: 'gün',

    // Language selector
    langLabel: 'Dil',
  },

  en: {
    appName: 'SpotAll',
    
    step1Label: 'Upload Data',
    step2Label: 'Analyze',
    step3Label: 'Configure',
    step4Label: 'Create Playlist',

    step1Title: 'Upload Your Spotify Listening Data',
    step1Desc: 'Upload your <strong>Extended Streaming History</strong> JSON files from Spotify.',
    howToTitle: 'How to get your data?',
    howToStep1: 'Go to <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener">Spotify Privacy Settings</a>',
    howToStep2: 'Check "Extended streaming history"',
    howToStep3: 'Click "Request data"',
    howToStep4: 'Spotify will send your data via email within 5-30 days',
    howToStep5: 'Upload the ZIP file or the JSON files from it here',
    uploadDragText: 'Drag & drop JSON or ZIP files here',
    uploadOr: 'or',
    uploadBrowse: 'Browse Files',
    uploadedFilesTitle: 'Uploaded Files',
    analyzeBtn: 'Analyze',

    step2Title: 'Listening Analysis',
    step2Desc: 'Your complete listening history has been analyzed! Here are the results:',
    statUniqueSongs: 'Unique Songs',
    statTotalPlays: 'Total Plays',
    statTotalTime: 'Total Time',
    statTopArtist: 'Top Artist',
    topSongsTitle: '🏆 Most Played Songs',
    searchPlaceholder: 'Search song or artist...',
    colRank: '#',
    colSong: 'Song',
    colArtist: 'Artist',
    colPlays: 'Plays',
    colTime: 'Time',
    showingCount: 'Showing {count} songs',
    loadMore: 'Load More',
    backBtn: 'Back',
    playlistSettingsBtn: 'Playlist Settings',

    step3Title: 'Playlist Settings',
    step3Desc: 'Choose how many songs to include and set a playlist name.',
    songCountLabel: 'Song Count',
    customLabel: 'Custom',
    customPlaceholder: 'Enter song count...',
    availableHint: 'Available: {count} unique songs',
    playlistNameLabel: 'Playlist Name',
    playlistNameDefault: 'My Top Songs — All Time',
    playlistDescLabel: 'Playlist Description',
    playlistDescDefault: 'My most played songs, ranked by play count.',
    filtersLabel: 'Filters',
    filterShortPlays: 'Ignore plays shorter than 30 seconds',
    filterSkips: 'Ignore skipped tracks',
    createPlaylistBtn: 'Create Playlist',

    step4Title: 'Create Playlist',
    step4Desc: 'Connect to Spotify and create your playlist!',
    connectTitle: 'Connect to Spotify',
    connectDesc: 'Log in to your Spotify account to create a playlist. We only request playlist creation permissions.',
    connectBtn: 'Connect with Spotify',
    creatingTitle: 'Creating playlist...',
    creatingSub: 'Adding songs to Spotify',
    addedLabel: 'Added',
    totalLabel: 'Total',
    failedLabel: 'Failed',
    successTitle: '🎉 Playlist Created!',
    successMsg: '{added} songs successfully added to your playlist.',
    openInSpotify: 'Open in Spotify',
    startOver: 'Start Over',

    footerText: 'Your data is processed entirely in your browser. Nothing is sent to any server.',

    toastFilesLoaded: '{count} files loaded',
    toastAnalyzing: 'Analyzing your data...',
    toastAnalyzed: '{count} unique songs found!',
    toastError: 'An error occurred: {msg}',
    toastConnected: 'Connected to Spotify!',
    toastPlaylistCreated: 'Playlist created successfully!',
    toastNoTracks: 'No tracks with URIs found.',
    toastRateLimit: 'Rate limited — waiting {seconds}s...',

    hours: 'hours',
    minutes: 'min',
    days: 'days',

    langLabel: 'Language',
  },

  de: {
    appName: 'SpotAll',
    step1Label: 'Daten hochladen',
    step2Label: 'Analysieren',
    step3Label: 'Konfigurieren',
    step4Label: 'Playlist erstellen',
    step1Title: 'Lade deine Spotify-Hördaten hoch',
    step1Desc: 'Lade deine <strong>Extended Streaming History</strong> JSON-Dateien von Spotify hoch.',
    howToTitle: 'Wie bekomme ich meine Daten?',
    howToStep1: 'Gehe zu <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener">Spotify Datenschutzeinstellungen</a>',
    howToStep2: 'Wähle "Extended Streaming History"',
    howToStep3: 'Klicke auf "Daten anfordern"',
    howToStep4: 'Spotify sendet deine Daten innerhalb von 5-30 Tagen per E-Mail',
    howToStep5: 'Lade die ZIP-Datei oder die JSON-Dateien hierher hoch',
    uploadDragText: 'JSON- oder ZIP-Dateien hierher ziehen',
    uploadOr: 'oder',
    uploadBrowse: 'Dateien auswählen',
    uploadedFilesTitle: 'Hochgeladene Dateien',
    analyzeBtn: 'Analysieren',
    step2Title: 'Höranalyse',
    step2Desc: 'Dein gesamter Hörverlauf wurde analysiert! Hier sind die Ergebnisse:',
    statUniqueSongs: 'Einzigartige Songs',
    statTotalPlays: 'Gesamt abgespielt',
    statTotalTime: 'Gesamtzeit',
    statTopArtist: 'Top-Künstler',
    topSongsTitle: '🏆 Meistgespielte Songs',
    searchPlaceholder: 'Song oder Künstler suchen...',
    colRank: '#',
    colSong: 'Song',
    colArtist: 'Künstler',
    colPlays: 'Plays',
    colTime: 'Zeit',
    showingCount: '{count} Songs angezeigt',
    loadMore: 'Mehr laden',
    backBtn: 'Zurück',
    playlistSettingsBtn: 'Playlist-Einstellungen',
    step3Title: 'Playlist-Einstellungen',
    step3Desc: 'Wähle die Anzahl der Songs und den Playlist-Namen.',
    songCountLabel: 'Songanzahl',
    customLabel: 'Benutzerdefiniert',
    customPlaceholder: 'Songanzahl eingeben...',
    availableHint: 'Verfügbar: {count} einzigartige Songs',
    playlistNameLabel: 'Playlist-Name',
    playlistNameDefault: 'My Top Songs — All Time',
    playlistDescLabel: 'Playlist-Beschreibung',
    playlistDescDefault: 'Meine meistgespielten Songs, sortiert nach Anzahl der Plays.',
    filtersLabel: 'Filter',
    filterShortPlays: 'Plays unter 30 Sekunden ignorieren',
    filterSkips: 'Übersprungene Tracks ignorieren',
    createPlaylistBtn: 'Playlist erstellen',
    step4Title: 'Playlist erstellen',
    step4Desc: 'Verbinde dich mit Spotify und erstelle deine Playlist!',
    connectTitle: 'Mit Spotify verbinden',
    connectDesc: 'Melde dich bei Spotify an, um eine Playlist zu erstellen.',
    connectBtn: 'Mit Spotify verbinden',
    creatingTitle: 'Playlist wird erstellt...',
    creatingSub: 'Songs werden zu Spotify hinzugefügt',
    addedLabel: 'Hinzugefügt',
    totalLabel: 'Gesamt',
    failedLabel: 'Fehlgeschlagen',
    successTitle: '🎉 Playlist erstellt!',
    successMsg: '{added} Songs erfolgreich zur Playlist hinzugefügt.',
    openInSpotify: 'In Spotify öffnen',
    startOver: 'Neu starten',
    footerText: 'Deine Daten werden vollständig in deinem Browser verarbeitet.',
    toastFilesLoaded: '{count} Dateien geladen',
    toastAnalyzing: 'Daten werden analysiert...',
    toastAnalyzed: '{count} einzigartige Songs gefunden!',
    toastError: 'Ein Fehler ist aufgetreten: {msg}',
    toastConnected: 'Mit Spotify verbunden!',
    toastPlaylistCreated: 'Playlist erfolgreich erstellt!',
    toastNoTracks: 'Keine Tracks mit URIs gefunden.',
    toastRateLimit: 'Rate-Limit — {seconds}s warten...',
    hours: 'Stunden',
    minutes: 'Min',
    days: 'Tage',
    langLabel: 'Sprache',
  },

  es: {
    appName: 'SpotAll',
    step1Label: 'Subir datos',
    step2Label: 'Analizar',
    step3Label: 'Configurar',
    step4Label: 'Crear Playlist',
    step1Title: 'Sube tus datos de escucha de Spotify',
    step1Desc: 'Sube tus archivos JSON de <strong>Extended Streaming History</strong> de Spotify.',
    howToTitle: '¿Cómo obtener tus datos?',
    howToStep1: 'Ve a <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener">Configuración de privacidad de Spotify</a>',
    howToStep2: 'Marca "Extended streaming history"',
    howToStep3: 'Haz clic en "Solicitar datos"',
    howToStep4: 'Spotify enviará tus datos por correo en 5-30 días',
    howToStep5: 'Sube el archivo ZIP o los archivos JSON aquí',
    uploadDragText: 'Arrastra archivos JSON o ZIP aquí',
    uploadOr: 'o',
    uploadBrowse: 'Seleccionar archivos',
    uploadedFilesTitle: 'Archivos subidos',
    analyzeBtn: 'Analizar',
    step2Title: 'Análisis de escucha',
    step2Desc: '¡Tu historial de escucha ha sido analizado! Aquí están los resultados:',
    statUniqueSongs: 'Canciones únicas',
    statTotalPlays: 'Reproducciones totales',
    statTotalTime: 'Tiempo total',
    statTopArtist: 'Artista principal',
    topSongsTitle: '🏆 Canciones más escuchadas',
    searchPlaceholder: 'Buscar canción o artista...',
    colRank: '#',
    colSong: 'Canción',
    colArtist: 'Artista',
    colPlays: 'Plays',
    colTime: 'Tiempo',
    showingCount: 'Mostrando {count} canciones',
    loadMore: 'Cargar más',
    backBtn: 'Atrás',
    playlistSettingsBtn: 'Ajustes de Playlist',
    step3Title: 'Ajustes de Playlist',
    step3Desc: 'Elige cuántas canciones incluir y el nombre de la playlist.',
    songCountLabel: 'Número de canciones',
    customLabel: 'Personalizado',
    customPlaceholder: 'Ingresa un número...',
    availableHint: 'Disponible: {count} canciones únicas',
    playlistNameLabel: 'Nombre de la Playlist',
    playlistNameDefault: 'My Top Songs — All Time',
    playlistDescLabel: 'Descripción de la Playlist',
    playlistDescDefault: 'Mis canciones más escuchadas, ordenadas por reproducciones.',
    filtersLabel: 'Filtros',
    filterShortPlays: 'Ignorar reproducciones menores a 30 segundos',
    filterSkips: 'Ignorar canciones saltadas',
    createPlaylistBtn: 'Crear Playlist',
    step4Title: 'Crear Playlist',
    step4Desc: '¡Conéctate a Spotify y crea tu playlist!',
    connectTitle: 'Conectar con Spotify',
    connectDesc: 'Inicia sesión en Spotify para crear una playlist.',
    connectBtn: 'Conectar con Spotify',
    creatingTitle: 'Creando playlist...',
    creatingSub: 'Añadiendo canciones a Spotify',
    addedLabel: 'Añadidas',
    totalLabel: 'Total',
    failedLabel: 'Fallidas',
    successTitle: '🎉 ¡Playlist creada!',
    successMsg: '{added} canciones añadidas exitosamente a tu playlist.',
    openInSpotify: 'Abrir en Spotify',
    startOver: 'Empezar de nuevo',
    footerText: 'Tus datos se procesan completamente en tu navegador.',
    toastFilesLoaded: '{count} archivos cargados',
    toastAnalyzing: 'Analizando tus datos...',
    toastAnalyzed: '¡{count} canciones únicas encontradas!',
    toastError: 'Ocurrió un error: {msg}',
    toastConnected: '¡Conectado a Spotify!',
    toastPlaylistCreated: '¡Playlist creada exitosamente!',
    toastNoTracks: 'No se encontraron tracks con URIs.',
    toastRateLimit: 'Límite de velocidad — esperando {seconds}s...',
    hours: 'horas',
    minutes: 'min',
    days: 'días',
    langLabel: 'Idioma',
  }
};

let currentLang = 'en';

/** Detect browser language and set initial locale */
export function detectLanguage() {
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  const saved = localStorage.getItem('spotall-lang');
  if (saved && translations[saved]) {
    currentLang = saved;
  } else if (translations[browserLang]) {
    currentLang = browserLang;
  } else {
    currentLang = 'en';
  }
  return currentLang;
}

/** Set the current language */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('spotall-lang', lang);
  }
}

/** Get current language code */
export function getLang() {
  return currentLang;
}

/** Get a translation string, with optional interpolation */
export function t(key, params = {}) {
  let text = translations[currentLang]?.[key] || translations.en?.[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

/** Get available languages */
export function getLanguages() {
  return Object.keys(translations).map(code => ({
    code,
    name: { tr: 'Türkçe', en: 'English', de: 'Deutsch', es: 'Español' }[code] || code,
    flag: { tr: '🇹🇷', en: '🇬🇧', de: '🇩🇪', es: '🇪🇸' }[code] || '🌐'
  }));
}
