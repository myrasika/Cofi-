/**
 * Cofi Music App
 * Data: local resource folder
 */

// ==================== LOCAL DATA ====================
const LOCAL_TRACKS = [
    {
        id: 'local-1',
        title: 'Love Is Wicked',
        artist: 'Brick Lace',
        duration: 0,
        preview: 'resource/music/Brick Lace - Love Is Wicked.m4a',
        cover: 'resource/cover/13862711350867865.jpeg'
    },
    {
        id: 'local-2',
        title: 'Ndihambe Nawe',
        artist: 'MAFIKIZOLO',
        duration: 0,
        preview: 'resource/music/MAFIKIZOLO - Ndihambe Nawe [kTlVd8hhkgI].mp3',
        cover: 'resource/cover/4574037117988474.jpeg'
    },
    {
        id: 'local-3',
        title: 'Kanungo',
        artist: 'Kanungo',
        duration: 0,
        preview: 'resource/music/Kanungo [Z-cCF7q9_GM].mp3',
        cover: 'resource/cover/2322237303170623.jpeg'
    },
    {
        id: 'local-4',
        title: 'In da Club',
        artist: 'Beyonce',
        duration: 0,
        preview: 'resource/music/Beyonce - In da Club [M4XKNXMMvi4].mp3',
        cover: 'resource/cover/2603712282300477.jpeg'
    },
    {
        id: 'local-5',
        title: 'Most I',
        artist: 'Most I',
        duration: 0,
        preview: 'resource/music/Most I [UmPJQuahZfo].mp3',
        cover: 'resource/cover/914862421319766.jpeg'
    }
];

const LOCAL_PLAYLISTS = [
    {
        id: 'local-playlist-1',
        title: 'All Tracks',
        description: 'All local tracks',
        trackIds: LOCAL_TRACKS.map(t => t.id)
    }
];

const LOCAL_ARTISTS = [
    { id: 'local-artist-1', name: 'Brick Lace', picture: 'resource/cover/13862711350867865.jpeg' },
    { id: 'local-artist-2', name: 'MAFIKIZOLO', picture: 'resource/cover/4574037117988474.jpeg' },
    { id: 'local-artist-3', name: 'Kanungo', picture: 'resource/cover/2322237303170623.jpeg' },
    { id: 'local-artist-4', name: 'Beyonce', picture: 'resource/cover/2603712282300477.jpeg' },
    { id: 'local-artist-5', name: 'Most I', picture: 'resource/cover/914862421319766.jpeg' }
];

function getLocalTrack(id) {
    return LOCAL_TRACKS.find(t => t.id === id);
}

function getLocalTracks(ids) {
    return ids.map(id => getLocalTrack(id)).filter(Boolean);
}

function getLocalPlaylist(id) {
    const playlist = LOCAL_PLAYLISTS.find(p => p.id === id);
    if (!playlist) return null;
    return {
        ...playlist,
        tracks: getLocalTracks(playlist.trackIds)
    };
}

function getLocalArtist(id) {
    return LOCAL_ARTISTS.find(a => a.id === id);
}

function searchLocalTracks(query) {
    const q = query.toLowerCase();
    return LOCAL_TRACKS.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q)
    );
}

function searchLocalArtists(query) {
    const q = query.toLowerCase();
    return LOCAL_ARTISTS.filter(a => a.name.toLowerCase().includes(q));
}

// ==================== AUDIO PLAYER ====================
const Player = {
    audio: document.getElementById('audio-player'),
    currentTrack: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 0,

    init() {
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('play', () => { this.isPlaying = true; this.updateUI(); });
        this.audio.addEventListener('pause', () => { this.isPlaying = false; this.updateUI(); });
        this.audio.addEventListener('error', (e) => {
            console.error('[Player] Audio error:', this.audio.error, e);
        });
    },

    loadTrack(track) {
        this.currentTrack = track;
        if (track.preview) {
            console.log('[Player] Loading track:', track.title, 'src:', track.preview);
            this.audio.src = track.preview;
            this.audio.load();
        } else {
            console.warn('[Player] No preview URL for track:', track.title);
        }
        this.updateNowPlaying();
        this.updateMiniPlayer();
    },

    play() {
        if (!this.audio.src) {
            console.warn('[Player] No audio src set');
            return;
        }
        console.log('[Player] Attempting play, readyState:', this.audio.readyState, 'networkState:', this.audio.networkState);
        const attemptPlay = () => {
            this.audio.play().catch((e) => {
                console.error('[Player] Playback failed:', e);
            });
        };
        if (this.audio.readyState >= 3) {
            attemptPlay();
        } else {
            this.audio.addEventListener('canplay', attemptPlay, { once: true });
        }
    },

    pause() {
        this.audio.pause();
    },

    toggle() {
        if (this.isPlaying) this.pause();
        else this.play();
    },

    next() {
        if (this.queue.length === 0) return;
        if (this.isShuffle) {
            this.queueIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.queueIndex = (this.queueIndex + 1) % this.queue.length;
        }
        this.loadTrack(this.queue[this.queueIndex]);
        this.play();
    },

    prev() {
        if (this.queue.length === 0) return;
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        if (this.isShuffle) {
            this.queueIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length;
        }
        this.loadTrack(this.queue[this.queueIndex]);
        this.play();
    },

    setQueue(tracks, startIndex = 0) {
        this.queue = tracks.filter(t => t.preview);
        this.queueIndex = startIndex;
        if (this.queue.length > 0) {
            this.loadTrack(this.queue[0]);
        }
    },

    handleTrackEnd() {
        if (this.repeatMode === 2) {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 1 || this.queueIndex < this.queue.length - 1) {
            this.next();
        } else {
            this.pause();
            this.audio.currentTime = 0;
            this.updateProgress();
        }
    },

    updateProgress() {
        const current = this.audio.currentTime;
        const duration = this.audio.duration || 0;
        const percentage = duration > 0 ? (current / duration) * 100 : 0;

        document.getElementById('progress-bar').style.width = percentage + '%';
        document.getElementById('progress-thumb').style.left = percentage + '%';
        document.getElementById('time-current').textContent = this.formatTime(current);
    },

    updateDuration() {
        document.getElementById('time-total').textContent = this.formatTime(this.audio.duration);
    },

    seek(percentage) {
        if (this.audio.duration) {
            this.audio.currentTime = (percentage / 100) * this.audio.duration;
        }
    },

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        document.getElementById('btn-shuffle').classList.toggle('text-primary', this.isShuffle);
        document.getElementById('btn-shuffle').classList.toggle('text-on-surface-variant', !this.isShuffle);
    },

    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        const btn = document.getElementById('btn-repeat');
        if (this.repeatMode === 0) {
            btn.classList.remove('text-primary');
            btn.classList.add('text-on-surface-variant');
            btn.innerHTML = '<span class="material-symbols-outlined">repeat</span>';
        } else if (this.repeatMode === 1) {
            btn.classList.add('text-primary');
            btn.classList.remove('text-on-surface-variant');
            btn.innerHTML = '<span class="material-symbols-outlined">repeat</span>';
        } else {
            btn.classList.add('text-primary');
            btn.classList.remove('text-on-surface-variant');
            btn.innerHTML = '<span class="material-symbols-outlined">repeat_one</span>';
        }
    },

    updateUI() {
        const playIcon = document.getElementById('play-icon');
        const miniPlayIcon = document.querySelector('#mini-play .material-symbols-outlined');
        const playBtn = document.getElementById('btn-play');

        if (this.isPlaying) {
            playIcon.textContent = 'pause';
            playIcon.style.fontVariationSettings = "'FILL' 1";
            miniPlayIcon.textContent = 'pause';
            miniPlayIcon.style.fontVariationSettings = "'FILL' 1";
            playBtn.classList.add('shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.4)]');
            playBtn.classList.remove('shadow-[inset_2px_2px_4px_rgba(92,97,70,0.1)]');
            document.getElementById('waveform').style.opacity = '0.4';
        } else {
            playIcon.textContent = 'play_arrow';
            playIcon.style.fontVariationSettings = "'FILL' 1";
            miniPlayIcon.textContent = 'play_arrow';
            miniPlayIcon.style.fontVariationSettings = "'FILL' 1";
            playBtn.classList.remove('shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.4)]');
            playBtn.classList.add('shadow-[inset_2px_2px_4px_rgba(92,97,70,0.1)]');
            document.getElementById('waveform').style.opacity = '0.1';
        }
    },

    updateNowPlaying() {
        const track = this.currentTrack;
        if (!track) return;

        document.getElementById('nowplaying-art').src = track.album?.cover_xl || track.album?.cover || '';
        document.getElementById('nowplaying-title').textContent = track.title;
        document.getElementById('nowplaying-artist').textContent = track.artist?.name || 'Unknown Artist';
        document.getElementById('time-total').textContent = this.formatTime(track.duration || 0);
        document.getElementById('time-current').textContent = '0:00';
        document.getElementById('progress-bar').style.width = '0%';
        document.getElementById('progress-thumb').style.left = '0%';
    },

    updateMiniPlayer() {
        const track = this.currentTrack;
        if (!track) return;

        document.getElementById('mini-art').src = track.album?.cover_medium || track.album?.cover || '';
        document.getElementById('mini-title').textContent = track.title;
        document.getElementById('mini-artist').textContent = track.artist?.name || 'Unknown Artist';
    },

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

// ==================== APP STATE & ROUTING ====================
const App = {
    currentView: 'home',
    trackCache: {},

    init() {
        Player.init();
        this.setupNavigation();
        this.setupPlayerControls();
        this.setupSearch();
        this.setupLibraryNav();
        this.setupEventDelegation();
        this.loadHome();
        this.showView('library');
    },

    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.group.cursor-pointer');
            if (!card) return;

            const trackData = card.dataset.track;
            if (trackData) {
                try {
                    const track = JSON.parse(trackData);
                    const context = card.dataset.context || '';
                    const index = parseInt(card.dataset.index || '0');
                    this.playTrack(track, context, index);
                } catch (err) {
                    console.error('Failed to parse track data', err);
                }
            }
        });

        document.addEventListener('click', (e) => {
            const row = e.target.closest('.track-row');
            if (!row) return;

            if (e.target.closest('button')) return;

            const trackData = row.dataset.track;
            if (trackData) {
                try {
                    const track = JSON.parse(trackData);
                    const context = row.dataset.context || '';
                    const index = parseInt(row.dataset.index || '0');
                    this.playTrackFromList(track, context, index);
                } catch (err) {
                    console.error('Failed to parse track data', err);
                }
            }
        });
    },

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                if (view) this.showView(view);
            });
        });

        document.getElementById('nav-nowplaying').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('nowplaying');
        });

        document.getElementById('nav-menu').addEventListener('click', () => {
            this.showView('library');
        });

        document.getElementById('nav-search').addEventListener('click', () => {
            this.showView('search');
            setTimeout(() => document.getElementById('search-input').focus(), 100);
        });

        document.getElementById('queue-hint').addEventListener('click', () => {
            this.showView('nowplaying');
        });

        document.getElementById('mini-player').addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.showView('nowplaying');
            }
        });
    },

    setupPlayerControls() {
        document.getElementById('btn-play').addEventListener('click', () => Player.toggle());
        document.getElementById('btn-next').addEventListener('click', () => Player.next());
        document.getElementById('btn-prev').addEventListener('click', () => Player.prev());
        document.getElementById('btn-shuffle').addEventListener('click', () => Player.toggleShuffle());
        document.getElementById('btn-repeat').addEventListener('click', () => Player.toggleRepeat());

        document.getElementById('mini-play').addEventListener('click', (e) => {
            e.stopPropagation();
            Player.toggle();
        });
        document.getElementById('mini-next').addEventListener('click', (e) => {
            e.stopPropagation();
            Player.next();
        });

        const progressRail = document.getElementById('progress-rail');
        progressRail.addEventListener('click', (e) => {
            const rect = progressRail.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            Player.seek(percentage);
        });
    },

    setupSearch() {
        let debounceTimer;
        const searchInput = document.getElementById('search-input');

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            if (query.length === 0) {
                document.getElementById('search-results').innerHTML = '';
                document.getElementById('search-empty').classList.remove('hidden');
                return;
            }

            debounceTimer = setTimeout(async () => {
                await this.performSearch(query);
            }, 400);
        });
    },

    async performSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        const loading = document.getElementById('search-loading');
        const empty = document.getElementById('search-empty');

        resultsContainer.innerHTML = '';
        loading.classList.remove('hidden');
        empty.classList.add('hidden');

        const results = searchLocalTracks(query);
        loading.classList.add('hidden');

        if (results && results.length > 0) {
            this.trackCache['search'] = results;
            this.renderTrackGrid(resultsContainer, results, 'search');
        } else {
            empty.textContent = 'No results found';
            empty.classList.remove('hidden');
        }
    },

    setupLibraryNav() {
        document.querySelectorAll('[data-library]').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.library;
                this.loadLibraryCategory(type);
            });
        });
    },

    showView(viewName) {
        this.currentView = viewName;

        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`view-${viewName}`)?.classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(link => {
            const isActive = link.dataset.view === viewName;
            link.classList.remove('bg-primary-container', 'text-on-primary-container');
            link.classList.add('text-on-surface-variant');
            if (isActive) {
                link.classList.add('bg-primary-container', 'text-on-primary-container');
                link.classList.remove('text-on-surface-variant');
            }
        });

        window.scrollTo(0, 0);
    },

    // ==================== RENDERERS ====================
    renderTrackGrid(container, tracks, context = '') {
        container.innerHTML = tracks.map((track, index) => {
            const safeTrack = this.sanitizeTrack(track);
            return `
                <div class="group cursor-pointer"
                     data-track="${this.escapeHtml(JSON.stringify(safeTrack))}"
                     data-context="${context}"
                     data-index="${index}">
                    <div class="relative aspect-square rounded-xl overflow-hidden organic-shadow inner-light-stroke mb-sm bg-surface-container-highest transition-transform duration-500 group-hover:scale-[1.02]">
                        <img class="w-full h-full object-cover" src="${safeTrack.album?.cover_xl || safeTrack.album?.cover || 'https://via.placeholder.com/300'}" alt="${this.escapeHtml(safeTrack.title)}"/>
                        <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div class="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <span class="material-symbols-outlined text-on-primary-container" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                            </div>
                        </div>
                    </div>
                    <h3 class="font-headline-md text-body-lg text-on-surface truncate">${this.escapeHtml(safeTrack.title)}</h3>
                    <p class="font-body-md text-on-surface-variant">${this.escapeHtml(safeTrack.artist?.name || 'Unknown')}</p>
                </div>
            `;
        }).join('');
    },

    renderTrackList(container, tracks, context = '') {
        container.innerHTML = tracks.map((track, index) => {
            const safeTrack = this.sanitizeTrack(track);
            return `
                <div class="track-row grid grid-cols-12 items-center px-md py-md rounded-xl group"
                     data-track="${this.escapeHtml(JSON.stringify(safeTrack))}"
                     data-context="${context}"
                     data-index="${index}">
                    <div class="col-span-1 font-body-md text-body-md text-outline">${index + 1}</div>
                    <div class="col-span-7 md:col-span-8 flex flex-col">
                        <span class="font-label-md text-label-md text-on-background">${this.escapeHtml(safeTrack.title)}</span>
                        <span class="font-body-md text-body-md text-on-surface-variant text-sm">${this.escapeHtml(safeTrack.artist?.name || 'Unknown')}</span>
                    </div>
                    <div class="hidden md:block md:col-span-2 font-body-md text-body-md text-on-surface-variant">${Player.formatTime(safeTrack.duration || 0)}</div>
                    <div class="col-span-4 md:col-span-1 text-right">
                        <button class="p-1 text-on-surface-variant hover:text-primary" onclick="event.stopPropagation()">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== DATA LOADERS ====================
    async loadHome() {
        const featuredContainer = document.getElementById('featured-grid');
        const trendingContainer = document.getElementById('trending-grid');

        featuredContainer.innerHTML = '<div class="col-span-full text-center py-xl"><div class="loading-spinner mx-auto"></div></div>';
        trendingContainer.innerHTML = '<div class="col-span-full text-center py-xl"><div class="loading-spinner mx-auto"></div></div>';

        const playlists = LOCAL_PLAYLISTS.slice(0, 3);
        const tracks = LOCAL_TRACKS;

        if (playlists.length > 0) {
            featuredContainer.innerHTML = playlists.map(playlist => `
                <div class="group cursor-pointer" onclick="App.openPlaylist('${playlist.id}')">
                    <div class="relative aspect-video rounded-xl overflow-hidden organic-shadow inner-light-stroke mb-sm bg-surface-container-highest transition-transform duration-500 group-hover:scale-[1.02]">
                        <img class="w-full h-full object-cover" src="${playlist.tracks[0]?.cover || 'https://via.placeholder.com/300'}" alt="${this.escapeHtml(playlist.title)}"/>
                    </div>
                    <h3 class="font-headline-md text-body-lg text-on-surface truncate">${this.escapeHtml(playlist.title)}</h3>
                    <p class="font-body-md text-on-surface-variant">${playlist.tracks.length} tracks</p>
                </div>
            `).join('');
        } else {
            featuredContainer.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No featured playlists available</p>';
        }

        if (tracks.length > 0) {
            this.trackCache['trending'] = tracks;
            this.renderTrackGrid(trendingContainer, tracks, 'trending');
        } else {
            trendingContainer.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No tracks available</p>';
        }
    },

    async loadLibraryCategory(type) {
        const grid = document.getElementById('library-grid');
        grid.innerHTML = '<div class="col-span-full text-center py-xl"><div class="loading-spinner mx-auto"></div></div>';

        let data = [];
        if (type === 'playlists') {
            data = LOCAL_PLAYLISTS.slice(0, 10);
        } else if (type === 'albums') {
            data = LOCAL_PLAYLISTS.slice(0, 10);
        } else if (type === 'artists') {
            data = LOCAL_ARTISTS.slice(0, 10);
        } else if (type === 'songs') {
            data = LOCAL_TRACKS.slice(0, 10);
        }

        if (type === 'artists' && data.length > 0) {
            grid.innerHTML = data.map(artist => `
                <div class="group cursor-pointer" onclick="App.openArtist('${artist.id}')">
                    <div class="relative aspect-square rounded-full overflow-hidden organic-shadow inner-light-stroke mb-sm bg-surface-container-highest transition-transform duration-500 group-hover:scale-[1.02]">
                        <img class="w-full h-full object-cover" src="${artist.picture || 'https://via.placeholder.com/300'}" alt="${this.escapeHtml(artist.name || '')}"/>
                    </div>
                    <h3 class="font-headline-md text-body-lg text-on-surface truncate text-center">${this.escapeHtml(artist.name || 'Unknown')}</h3>
                    <p class="font-body-md text-on-surface-variant text-center">Artist</p>
                </div>
            `).join('');
        } else if (type === 'songs' && data.length > 0) {
            this.trackCache['library-songs'] = data;
            this.renderTrackGrid(grid, data, 'library-songs');
        } else if (data.length > 0) {
            grid.innerHTML = data.map(item => {
                const cover = item.tracks ? item.tracks[0]?.cover : (item.cover || 'https://via.placeholder.com/300');
                const title = item.title || item.name || 'Untitled';
                const countLabel = item.tracks ? `${item.tracks.length} tracks` : (item.type || '');
                return `
                <div class="group cursor-pointer" onclick="App.openPlaylist('${item.id}')">
                    <div class="relative aspect-square rounded-xl overflow-hidden organic-shadow inner-light-stroke mb-sm bg-surface-container-highest transition-transform duration-500 group-hover:scale-[1.02]">
                        <img class="w-full h-full object-cover" src="${cover}" alt="${this.escapeHtml(title)}"/>
                    </div>
                    <h3 class="font-headline-md text-body-lg text-on-surface truncate">${this.escapeHtml(title)}</h3>
                    <p class="font-body-md text-on-surface-variant">${countLabel}</p>
                </div>
            `;
            }).join('');
        } else {
            grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No items found</p>';
        }

        this.showView('library');
    },

    async openPlaylist(id) {
        const tracksContainer = document.getElementById('playlist-tracks');

        document.getElementById('playlist-cover').src = '';
        document.getElementById('playlist-title').textContent = 'Loading...';
        document.getElementById('playlist-description').textContent = '';
        tracksContainer.innerHTML = '<div class="text-center py-xl"><div class="loading-spinner mx-auto"></div></div>';

        this.showView('playlist');

        const playlist = getLocalPlaylist(id);
        if (!playlist) {
            tracksContainer.innerHTML = '<p class="text-center text-on-surface-variant">Failed to load playlist</p>';
            return;
        }

        const cover = playlist.tracks[0]?.cover || 'https://via.placeholder.com/300';
        document.getElementById('playlist-cover').src = cover;
        document.getElementById('playlist-title').textContent = playlist.title || 'Untitled';
        document.getElementById('playlist-description').textContent = playlist.description || `${playlist.tracks.length} tracks`;

        const tracks = playlist.tracks;

        if (tracks.length > 0) {
            this.renderTrackList(tracksContainer, tracks, `playlist-${id}`);
        } else {
            tracksContainer.innerHTML = '<p class="text-center text-on-surface-variant">No tracks in this playlist</p>';
        }

        document.getElementById('playlist-shuffle').onclick = () => {
            if (tracks.length > 0) {
                const validTracks = tracks.filter(t => t.preview);
                if (validTracks.length > 0) {
                    Player.setQueue(validTracks, 0);
                    Player.play();
                }
            }
        };
    },

    async openArtist(id) {
        const tracksContainer = document.getElementById('playlist-tracks');

        document.getElementById('playlist-cover').src = '';
        document.getElementById('playlist-title').textContent = 'Loading...';
        document.getElementById('playlist-description').textContent = '';
        tracksContainer.innerHTML = '<div class="text-center py-xl"><div class="loading-spinner mx-auto"></div></div>';

        this.showView('playlist');

        const artist = getLocalArtist(id);
        if (!artist) {
            tracksContainer.innerHTML = '<p class="text-center text-on-surface-variant">Failed to load artist</p>';
            return;
        }

        document.getElementById('playlist-cover').src = artist.picture || 'https://via.placeholder.com/300';
        document.getElementById('playlist-title').textContent = artist.name || 'Unknown';
        document.getElementById('playlist-description').textContent = 'Local Artist';

        const artistTracks = LOCAL_TRACKS.filter(t => t.artist === artist.name);

        if (artistTracks.length > 0) {
            this.renderTrackList(tracksContainer, artistTracks, `artist-${id}`);
        } else {
            tracksContainer.innerHTML = '<p class="text-center text-on-surface-variant">No tracks available</p>';
        }

        document.getElementById('playlist-shuffle').onclick = () => {
            if (artistTracks.length > 0) {
                const validTracks = artistTracks.filter(t => t.preview);
                if (validTracks.length > 0) {
                    Player.setQueue(validTracks, 0);
                    Player.play();
                }
            }
        };
    },

    playTrack(track, context, index) {
        Player.loadTrack(track);

        const cachedTracks = this.trackCache[context];
        if (cachedTracks && cachedTracks.length > 0) {
            const validTracks = cachedTracks.filter(t => t.preview);
            Player.queue = validTracks;
            Player.queueIndex = validTracks.findIndex(t => t.id === track.id);
            if (Player.queueIndex < 0) Player.queueIndex = 0;
        } else {
            Player.queue = [track];
            Player.queueIndex = 0;
        }

        Player.play();
        this.showView('nowplaying');
    },

    playTrackFromList(track, context, index) {
        Player.loadTrack(track);
        Player.play();
        this.showView('nowplaying');
    },

    // ==================== UTILITIES ====================
    sanitizeTrack(track) {
        if (!track || typeof track !== 'object') {
            return {
                id: 0,
                title: 'Untitled',
                duration: 0,
                preview: '',
                artist: { name: 'Unknown Artist', id: 0, picture: '', picture_xl: '' },
                album: { id: 0, title: '', cover: '', cover_xl: '', cover_medium: '' }
            };
        }

        return {
            id: track.id,
            title: track.title || 'Untitled',
            duration: track.duration || 0,
            preview: track.preview || '',
            artist: {
                name: track.artist || 'Unknown Artist',
                id: track.artistId || 0,
                picture: track.cover || '',
                picture_xl: track.cover || ''
            },
            album: {
                id: track.albumId || 0,
                title: track.albumTitle || '',
                cover: track.cover || '',
                cover_xl: track.cover || '',
                cover_medium: track.cover || ''
            }
        };
    },

    escapeHtml(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
