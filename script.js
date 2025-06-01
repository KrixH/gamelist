document.addEventListener('DOMContentLoaded', init);

const CONFIG = {
    fallbackImage  : 'https://i.imgur.com/RH2EguE.png',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/',
};

function init() {
    const gamesContainer   = document.getElementById('gamesContainer');
    const searchInput      = document.getElementById('searchInput');
    const categorySelect   = document.getElementById('categorySelect');
    const developerSelect  = document.getElementById('developerSelect');
    const statusSelect     = document.getElementById('statusSelect');
    const trailerModal     = document.getElementById('trailerModal');
    const trailerFrame     = document.getElementById('trailerFrame');
    const modalClose       = document.querySelector('.close');
    let   gamesData        = [];
    let   preprocessedData = {};

    async function loadGames() {
        try {
            const response  = await fetch('games.json');
            const data      = await response.json();
                  gamesData = data.games.map(game => ({
                nonCompletable: false,
                progress      : null,
                ...game
            }));
            preprocessedData = preprocessData(gamesData);
            preloadImages();
            generateFilters(preprocessedData);
            displayGames(gamesData);
        } catch (error) {
            console.error('Hiba:', error);
            gamesContainer.innerHTML = '<p>Nem sikerült betölteni az adatokat.</p>';
        }
    }

    function preprocessData(data) {
        return {
            categories: [...new Set(data.flatMap(game => game.category))],
            developers: [...new Set(data.flatMap(game => 
                Array.isArray(game.developer) ? game.developer: [game.developer]
            ).filter(Boolean))],
        };
    }

    function preloadImages() {
        gamesData.forEach(game => {
            const img         = new Image();
                  img.src     = getCoverUrl(game);
                  img.onerror = () => {
                console.warn(`Failed to load cover for ${game.title}, using fallback`);
                img.src = CONFIG.fallbackImage;
            };
        });
    }

    function getCoverUrl(game) {
        if (game.cover) {
            return game.cover;
        }
        else if (game.steamId) {
            return `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg`;
        }
        else {
            return CONFIG.fallbackImage;
        }
    }

    function generateFilters({ categories, developers }) {
        categorySelect.innerHTML = `
            <option value = "all">Összes kategória</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        `;

        developerSelect.innerHTML = `
            <option value = "all">Összes fejlesztő</option>
            ${developers.map(dev => `<option value="${dev}">${dev}</option>`).join('')}
        `;

        statusSelect.innerHTML = `
            <option value = "all">Összes állapot</option>
            <option value = "inprogress">Jelenleg futó végigjátszások</option>
            <option value = "completed">Befejezett végigjátszások</option>
            <option value = "noncompletable">Nem befejezhető</option>
        `;
    }

    function updateFilters() {
        const term      = searchInput.value.toLowerCase();
        const category  = categorySelect.value;
        const developer = developerSelect.value;
        const status    = statusSelect.value;

        let filtered = gamesData;

        if (category !== 'all') {
            filtered = filtered.filter(game => game.category.includes(category));
        }

        if (developer !== 'all') {
            filtered = filtered.filter(game => 
                Array.isArray(game.developer) 
                    ? game.developer.includes(developer) 
                    : game.developer === developer
            );
        }

        if (term) {
            filtered = filtered.filter(game => 
                game.title.toLowerCase().includes(term)
            );
        }

        if (status !== 'all') {
            filtered = filtered.filter(game => {
                if     (status === 'noncompletable') return game.nonCompletable === true;
                if     (status === 'completed') return game.progress            === 100;
                return !game.nonCompletable && game.progress                    !== 100;
            });
        }

        displayGames(filtered);
    }

    function displayGames(games) {
        const sorted = [...games].sort((a, b) => a.title.localeCompare(b.title, 'hu'));
        
        const completed = sorted.filter(game => 
            game.progress       === 100 &&
            game.nonCompletable !== true
        );
        
        const nonCompletable = sorted.filter(game => 
            game.nonCompletable === true
        );
        
        const inprogress = sorted.filter(game => 
            !nonCompletable.includes(game) && 
            !completed.includes(game)
        );

        gamesContainer.innerHTML = `
            ${createSection('Jelenleg futó végigjátszások', inprogress, 'inprogress')}
            ${createSection('Befejezett végigjátszások', completed, 'completed')}
            ${createSection('Nem befejezhető játékok', nonCompletable, 'noncompletable')}
        `;

        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(bar => {
                const progress        = bar.parentElement.getAttribute('data-progress');
                      bar.style.width = progress ? `${progress}%` : '0%';
            });
        }, 100);
    }

    function createSection(title, games, type) {
        if (games.length === 0) return '';
        return `
            <div class = "games-section ${type}-section">
            <h2  class = "section-title">${title}</h2>
            <div class = "games-grid">
                    ${games.map(game => createGameCard(game)).join('')}
                </div>
            </div>
        `;
    }

    function createGameCard(game) {
        const isNew       = checkIfNew(game.dateAdded);
        const hasProgress = typeof game.progress === 'number';
    
        return `
            <div class   = "game-card" data-status = "${game.nonCompletable ? 'noncompletable' : game.progress === 100 ? 'completed' : 'inprogress'}">
            <div class   = "game-cover">
            <img src     = "${`https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg`}"
                 alt     = "${game.title}"
                 onerror = "if (!this.dataset.fallback) { this.dataset.fallback = 'true'; this.src='${game.cover || CONFIG.fallbackImage}'; }">
                    ${isNew ? '<div class="new-badge">ÚJ</div>' : ''}
                    <div class = "game-actions">
                        ${createActionButtons(game)}
                    </div>
                </div>
                <div class = "game-info">
                <div class = "game-header">
                <h3  class = "game-title">${game.title}</h3>
                        ${hasProgress ? `<div class="game-progress">${game.progress}%</div>` : ''}
                    </div>
                    ${createGameDetails(game)}
                    ${hasProgress ? `
                        <div class = "progress-bar" data-progress = "${game.progress}">
                        <div class = "progress-fill"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function createActionButtons(game) {
        return `
            ${game.steamId ? `<button class="action-btn steam-btn" onclick="window.open('https://store.steampowered.com/app/${game.steamId}', '_blank')"><i class="fab fa-steam"></i></button>` : ''}
            ${game.playstationStoreId ? `<button class="action-btn ps-btn" onclick="window.open('https://store.playstation.com/en-us/concept/${game.playstationStoreId}', '_blank')"><i class="fab fa-playstation"></i></button>` : ''}
            ${game.xboxStoreId ? `<button class="action-btn xbox-btn" onclick="window.open('https://www.xbox.com/en-us/games/store/${game.xboxStoreId}', '_blank')"><i class="fab fa-xbox"></i></button>` : ''}
            ${game.googlePlayStoreId ? `<button class="action-btn google-btn" onclick="window.open('https://play.google.com/store/apps/details?id=${game.googlePlayStoreId}', '_blank')"><i class="fab fa-google-play"></i></button>` : ''}
            ${game.videoId ? `<button class="action-btn youtube-btn" onclick="showTrailer('${game.videoId}')"><i class="fab fa-youtube"></i></button>` : ''}
        `;
    }

function createGameDetails(game) {
    let releaseDatesHtml = '';
    if (game.releaseDates && Array.isArray(game.releaseDates)) {
        game.releaseDates.forEach(release => {
            const platformLabel = {
                pc    : 'PC',
                ps    : 'PlayStation',
                xbox  : 'Xbox',
                switch: 'Nintendo Switch',
                mobile: 'Mobil'
            }[release.platform] || 'Ismeretlen platform';

            const typeLabel = {
                'full-release'  : 'Teljes kiadás',
                'early-access'  : 'Korai hozzáférés',
                'remastered'    : 'Remastered',
                'server-closed' : 'Leállított szerverek',
                'in-development': 'Fejlesztés alatt'
            }[release.type] || release.type;

            releaseDatesHtml += `
                <div class="release-date ${release.type?.toLowerCase().replace(' ', '-')}${release.platform ? ' platformed' : ''}">
                    ${
                        release.platform
                            ? `<span class="platform-label platform-${release.platform}">${platformLabel}</span> – ${typeLabel}: ${formatDate(release.date)}`
                            : `${typeLabel}: ${formatDate(release.date)}`
                    }
                </div>
            `;


        });
    } else if (game.releaseDate) {
        releaseDatesHtml = `
            <div class = "release-date">
                Megjelenés: ${formatDate(game.releaseDate)}
            </div>
        `;
    }

    let developmentStatusHtml = '';
    if (game.developmentStatus && Array.isArray(game.developmentStatus)) {
        developmentStatusHtml = `
            <div class = "game-detail-row">
            <div class = "development-status-container">
                    ${game.developmentStatus.map(status => `
                        <div class = "development-status ${status}">
                        <i   class = "fas ${getStatusIcon(status)}"></i>
                            ${getStatusText(status)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (game.developmentStatus) {
        developmentStatusHtml = `
            <div class = "game-detail-row">
            <div class = "development-status-container">
            <div class = "development-status ${game.developmentStatus}">
            <i   class = "fas ${getStatusIcon(game.developmentStatus)}"></i>
                        ${getStatusText(game.developmentStatus)}
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class = "game-details">
            ${game.platforms && game.platforms.length > 0 ? `
                <div class = "game-detail-row">
                <div class = "platform-tags">
                        ${createPlatformTag(game)} 
                    </div>
                </div>
            ` : ''}
            ${game.multiplayer && Array.isArray(game.multiplayer) && game.multiplayer.length > 0 ? `
                <div class = "game-detail-row">
                <div class = "multiplayer-tags">
                        ${game.multiplayer.map(mode => `
                            <div class = "multiplayer-tag ${mode}">
                            <i   class = "fas ${mode === 'local' ? 'fa-users' : 'fa-globe'}"></i>
                                ${mode === 'local' ? 'Helyi többjátékos' : 'Online többjátékos'}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${developmentStatusHtml}
            ${releaseDatesHtml}
            ${game.progress === 100 && game.finishDate ? `
                <div class = "game-detail-row">
                <div class = "finished-date">
                         Végigjátszva: ${formatDate(game.finishDate)}
                    </div>
                </div>
            ` : ''}
            ${game.playTime ? `
                <div class = "game-detail-row">
                <div class = "playtime">
                <i   class = "fas fa-clock"></i> Játékidő: ${game.playTime}
                    </div>
                </div>
            ` : ''}
            ${game.developer ? `
                <div class = "game-detail-row">
                <div class = "developer-tags">
                        ${(Array.isArray(game.developer) ? game.developer : [game.developer])
                            .filter(dev => dev)
                            .map(dev => `<span class="developer-tag">${dev}</span>`)
                            .join('')}
                    </div>
                </div>
            ` : ''}
            <div class = "game-detail-row">
            <div class = "category-tags">${game.category.map(cat => `<span class="category-tag">${cat}</span>`).join('')}</div>
            </div>
        </div>
    `;
}


    function createPlatformTag(game) {
        let platformTags = '';
    
        if (game.platforms) {
            game.platforms.forEach(platform => {
                const platformLower                                                                         = platform.toLowerCase();
                if    (platformLower.includes('pc')) platformTags                                          += '<span class="platform-tag" title="PC"><i class="fab fa-windows"></i></span>';
                if    (platformLower.includes('playstation') || platformLower.includes('ps')) platformTags += '<span class="platform-tag" title="PlayStation"><i class="fab fa-playstation"></i></span>';
                if    (platformLower.includes('xbox')) platformTags                                        += '<span class="platform-tag" title="Xbox"><i class="fab fa-xbox"></i></span>';
                if    (platformLower.includes('android') || platformLower.includes('mobile')) platformTags += '<span class="platform-tag" title="Mobile/Android"><i class="fab fa-android"></i></span>';
            });
        }
    
        if (game.hasDLC) {
            platformTags += `
                <span class = "dlc-tag">
                <span class = "dlc-icon"><i class = "fas fa-puzzle-piece"></i></span>
                <span class = "dlc-text">DLC</span>
                </span>
            `;
        }
    
        return platformTags;
    }

    function getStatusIcon(status) {
        const icons = {
            'in-development': 'fa-tools',
            'early-access'  : 'fa-exclamation-triangle',
            'server-closed' : 'fa-server',
            'remastered'    : 'fa-redo-alt'
        };
        return icons[status] || 'fa-info-circle';
    }
    
    function getStatusText(status) {
        const texts = {
            'in-development': 'Fejlesztés alatt',
            'early-access'  : 'Korai hozzáférés',
            'server-closed' : 'Leállított szerverek',
            'remastered'    : 'Remastered változat',
            'released'      : 'Megjelent',
            'full-release'  : 'Teljes kiadás'
        };
        return texts[status] || 'Ismeretlen állapot';
    }

    function checkIfNew(date) {
        if (!date) return false;
        const addedDate = new Date(date);
        const today     = new Date();
        const diffTime  = today - addedDate;
        const diffDays  = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 7;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Nincs adat';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('hu-HU', options);
    }

    searchInput.addEventListener('input', updateFilters);
    categorySelect.addEventListener('change', updateFilters);
    developerSelect.addEventListener('change', updateFilters);
    statusSelect.addEventListener('change', updateFilters);

    window.showTrailer = (videoId) => {
        trailerFrame.src           = `${CONFIG.youtubeEmbedUrl}${videoId}?autoplay=1`;
        trailerModal.style.display = 'block';
    };

    function closeModal() {
        trailerModal.style.display = 'none';
        trailerFrame.src           = '';
    }

    modalClose.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === trailerModal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    loadGames();
}

const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top     : 0,
        behavior: 'smooth'
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const yearSpan             = document.getElementById('currentYear');
          yearSpan.textContent = new Date().getFullYear();
});