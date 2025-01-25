document.addEventListener('DOMContentLoaded', init);

function init() {
    const gamesContainer = document.getElementById('gamesContainer');
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const developerSelect = document.getElementById('developerSelect');
    const trailerModal = document.getElementById('trailerModal');
    const trailerFrame = document.getElementById('trailerFrame');
    let gamesData = [];

    async function loadGames() {
        try {
            const response = await fetch('games.json');
            const data = await response.json();
            gamesData = data.games;
            preloadImages();
            generateFilters();
            displayGames(gamesData);
        } catch (error) {
            console.error('Hiba:', error);
        }
    }

    function preloadImages() {
        gamesData.forEach(game => {
            const img = new Image();
            img.src = getCoverUrl(game);
            img.onerror = () => img.src = 'https://i.imgur.com/RH2EguE.png';
        });
    }

    function getCoverUrl(game) {
        return game.steamId 
            ? `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg`
            : game.cover || 'https://i.imgur.com/RH2EguE.png';
    }

    function generateFilters() {
        // Kategóriák
        const categories = [...new Set(gamesData.flatMap(game => game.category))];
        categories.sort((a, b) => a.localeCompare(b, 'hu'));
        
        // Fejlesztők
        const developers = [...new Set(gamesData.flatMap(game => 
            Array.isArray(game.developer) ? game.developer : [game.developer]
        ).filter(Boolean))];
        developers.sort((a, b) => a.localeCompare(b, 'hu'));

        categorySelect.innerHTML = `
            <option value="all">Összes kategória</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        `;

        developerSelect.innerHTML = `
            <option value="all">Összes fejlesztő</option>
            ${developers.map(dev => `<option value="${dev}">${dev}</option>`).join('')}
        `;
    }

    function updateFilters() {
        const term = searchInput.value.toLowerCase();
        const category = categorySelect.value;
        const developer = developerSelect.value;
        
        let filtered = gamesData;
        
        if (category !== 'all') {
            filtered = filtered.filter(game => game.category.includes(category));
        }
        
        if (term) {
            filtered = filtered.filter(game => 
                game.title.toLowerCase().includes(term)
            );
        }
        
        if (developer !== 'all') {
            filtered = filtered.filter(game => 
                Array.isArray(game.developer) 
                    ? game.developer.includes(developer) 
                    : game.developer === developer
            );
        }
        
        displayGames(filtered);
        
        if (filtered.length === 0) {
            gamesContainer.innerHTML = `<div class="no-results">Nincs találat a szűrési feltételeknek megfelelő játékra.</div>`;
        }
    }

    function displayGames(games) {
        const sorted = [...games].sort((a, b) => a.title.localeCompare(b.title, 'hu'));
        const completed = sorted.filter(game => game.progress === 100);
        const inprogress = sorted.filter(game => game.progress !== 100);

        gamesContainer.innerHTML = `
            ${createSection('Befejezett játékok', completed, 'completed')}
            ${createSection('Folyamatban lévő játékok', inprogress, 'inprogress')}
        `;

        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(bar => {
                bar.style.width = bar.parentElement.getAttribute('data-progress') + '%';
            });
        }, 100);
    }

    function createSection(title, games, type) {
        if (games.length === 0) return '';
        return `
            <div class="games-section ${type}-section">
                <h2 class="section-title">${title}</h2>
                <div class="games-grid">
                    ${games.map(game => createGameCard(game, type)).join('')}
                </div>
            </div>
        `;
    }

    function createGameCard(game, sectionType) {
        const isNew = checkIfNew(game.dateAdded);
        const status = game.progress === 100 ? 'completed' : 'inprogress';
        const coverUrl = getCoverUrl(game);

        return `
            <div class="game-card" data-status="${status}">
                <div class="game-cover">
                    <img src="${coverUrl}" alt="${game.title}" 
                         onerror="this.src='https://i.imgur.com/iYNdJeW.jpeg'">
                    ${isNew ? '<div class="new-badge">ÚJ</div>' : ''}
                    <div class="game-actions">
                        ${game.steamId ? `
                            <button class="action-btn" 
                                onclick="window.open('https://store.steampowered.com/app/${game.steamId}', '_blank')">
                                <i class="fab fa-steam"></i>
                            </button>
                        ` : ''}
                        ${game.videoId ? `
                            <button class="action-btn" onclick="showTrailer('${game.videoId}')">
                                <i class="fab fa-youtube"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="game-info">
                    <div class="game-header">
                        <h3 class="game-title">${game.title}</h3>
                        ${typeof game.progress === 'number' ? `
                            <div class="game-progress">${game.progress}%</div>
                        ` : ''}
                    </div>
                    <div class="game-details">
                        ${game.platforms && game.platforms.length > 0 ? `
                            <div class="platform-tags">
                                ${game.platforms.map(platform => {
                                    const platformLower = platform.toLowerCase();
                                    if(platformLower.includes('pc')) {
                                        return `<span class="platform-tag" title="PC"><i class="fab fa-windows"></i></span>`;
                                    } else if(platformLower.includes('playstation') || platformLower.includes('ps')) {
                                        return `<span class="platform-tag" title="PlayStation"><i class="fab fa-playstation"></i></span>`;
                                    } else if(platformLower.includes('xbox')) {
                                        return `<span class="platform-tag" title="Xbox"><i class="fab fa-xbox"></i></span>`;
                                    }
                                    return '';
                                }).join('')}
                            </div>
                        ` : ''}
                        <div class="release-date">
                            Megjelenés: ${formatDate(game.releaseDate)}
                        </div>
                        ${game.progress === 100 && game.finishDate ? `
                            <div class="finished-date">
                                <i class="fas fa-check"></i>
                                Végigjátszva: ${formatDate(game.finishDate)}
                            </div>
                        ` : ''}
                        ${game.developer ? `
                            <div class="developer-tags">
                                ${(Array.isArray(game.developer) ? game.developer : [game.developer])
                                    .map(dev => `<span class="developer-tag">${dev}</span>`)
                                    .join('')}
                            </div>
                        ` : ''}
                        <div class="category-tags">
                            ${game.category.map(cat => `
                                <span class="category-tag">${cat}</span>
                            `).join('')}
                        </div>
                    </div>
                    ${typeof game.progress === 'number' ? `
                        <div class="progress-bar" data-progress="${game.progress}">
                            <div class="progress-fill"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function checkIfNew(date) {
        if (!date) return false;
        const addedDate = new Date(date);
        const today = new Date();
        const diffTime = today - addedDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays < 7;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Nincs adat';
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('hu-HU', options);
    }

    // Eseményfigyelők
    searchInput.addEventListener('input', updateFilters);
    categorySelect.addEventListener('change', updateFilters);
    developerSelect.addEventListener('change', updateFilters);

    window.showTrailer = (videoId) => {
        trailerFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        trailerModal.style.display = 'block';
    };

    document.querySelector('.close').addEventListener('click', () => {
        trailerModal.style.display = 'none';
        trailerFrame.src = '';
    });

    loadGames();
}

// Vissza a tetejére gomb
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
        top: 0,
        behavior: 'smooth'
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('currentYear');
    yearSpan.textContent = new Date().getFullYear();
});