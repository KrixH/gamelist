document.addEventListener("DOMContentLoaded", () => {
    const sections = ["inProgress", "completed", "openWorld", "mmo", "abandoned", "pending", "simulator", "notStarted"];
    let remainingGames = [];

    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('gameSearch');

    function renderGames(games) {
        remainingGames = games;
        sections.forEach(sectionKey => {
            renderGamesForSection(sectionKey);
        });
    }

    function renderGamesForSection(sectionKey) {
        const sectionElement = document.getElementById(`${sectionKey}Games`);
        sectionElement.innerHTML = '';

        const sectionGames = remainingGames.filter(game => determineSectionKey(game.finishDate) === sectionKey)
            .sort((a, b) => a.title.localeCompare(b.title));

        if (sectionGames.length > 0) {
            toggleSectionVisibility(sectionKey, true);
            sectionGames.forEach(game => {
                const gameDiv = createGameDiv(game);
                sectionElement.appendChild(gameDiv);
                gameDiv.classList.add('show');
            });
        } else {
            toggleSectionVisibility(sectionKey, false);
        }
    }

    function toggleSectionVisibility(sectionKey, isVisible) {
        const section = document.getElementById(`${sectionKey}Section`);
        const header = document.getElementById(`${sectionKey}Header`);
        const displayValue = isVisible ? 'block' : 'none';

        section.style.display = displayValue;
        header.style.display = displayValue;
    }

    function determineSectionKey(finishDate) {
        const sectionMap = {
            "VA": "inProgress",
            "AH": "abandoned",
            "P": "pending",
            "OW": "openWorld",
            "MMO": "mmo",
            "SIM": "simulator",
            "NS": "notStarted"
        };

        for (const key in sectionMap) {
            if (finishDate.includes(key)) return sectionMap[key];
        }
        return "completed";
    }

    function createRadialProgressBar(progress) {
        let progressClass = '';

        if (progress < 20) {
            progressClass = 'low';
        } else if (progress < 40) {
            progressClass = 'medium';
        } else if (progress < 80) {
            progressClass = 'good';
        } else if (progress < 100) {
            progressClass = 'high';
        } else {
            progressClass = 'complete spin';
        }

        return `
            <div class="radial-progress-bar ${progressClass}" style="--progress: ${progress}">
                <span>${progress}%</span>
            </div>
        `;
    }

    function createGameDiv(game) {
        const finishDateClass = determineSectionKey(game.finishDate);
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game');
        gameDiv.setAttribute('data-title', game.title.toLowerCase());

        const isNew = checkIfNew(game.dateAdded);
        let newBadgeHTML = '';
        if (isNew) {
            newBadgeHTML = '<span class="new-badge">ÚJ</span>';
        }

        gameDiv.innerHTML = `
        <div class="game-card">
            ${newBadgeHTML}
            <div class="game-image-container">
                <img src="${game.cover}" alt="${game.title}" class="game-cover">
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="categories">${game.category.split(",").map(createCategoryElement).join("")}</div>
                ${game.earlyAccess ? createParagraph("early-access", `Korai hozzáférés: ${game.earlyAccess}`) : ''}
                ${game.releaseDate ? createParagraph("release-date", `Megjelenés: ${game.releaseDate}`) : ''}
                <p class="finish-date ${finishDateClass}">${formatFinishDateText(finishDateClass, game.finishDate)}</p>
                ${game.playTime ? formatPlayTimeText(game.playTime, finishDateClass) : ''}
                ${((finishDateClass === 'inProgress' || finishDateClass === 'completed') && game.progress) ? createRadialProgressBar(game.progress) : ''}
            </div>
        </div>
    `;
    

        const buttonContainer = createButtonContainer(game);
        if (buttonContainer) gameDiv.appendChild(buttonContainer);

        gameDiv.addEventListener('mouseenter', () => {
            const radialBar = gameDiv.querySelector('.radial-progress-bar');
            const newBadge = gameDiv.querySelector('.new-badge');
            if (radialBar) {
                radialBar.style.display = 'flex';
            }
            if (newBadge) {
                newBadge.style.display = 'none';
            }
        });

        gameDiv.addEventListener('mouseleave', () => {
            const radialBar = gameDiv.querySelector('.radial-progress-bar');
            const newBadge = gameDiv.querySelector('.new-badge');
            if (radialBar) {
                radialBar.style.display = 'none';
            }
            if (newBadge) {
                newBadge.style.display = 'inline';
            }
        });

        return gameDiv;
    }

    function checkIfNew(dateAdded) {
        const now = new Date();
        const addedDate = new Date(dateAdded);
        const differenceInDays = Math.floor((now - addedDate) / (1000 * 60 * 60 * 24));
        return differenceInDays <= 7; 
    }

    function createCategoryElement(category) {
        return `<div class="category">${category.trim()}</div>`;
    }

    function createButtonContainer(game) {
        const container = document.createElement('div');
        container.classList.add('button-container');

        if (game.steamId) {
            container.appendChild(createButton('a', 'steam-button', `https://store.steampowered.com/app/${game.steamId}`, 'fab fa-steam', 'Steam webáruház'));
        }

        if (game.videoId) {
            const youtubeButton = createButton('button', 'youtube-button', '#', 'fab fa-youtube', 'Trailer videó');
            youtubeButton.addEventListener("click", () => openVideoModal(game.videoId));
            container.appendChild(youtubeButton);
        }

        return container.children.length > 0 ? container : null;
    }

    function createButton(tag, buttonClass, href, iconClass, tooltipText) {
        const button = document.createElement(tag);
        button.classList.add(buttonClass);
        if (tag === 'a') button.href = href;
        button.target = "_blank";
        button.innerHTML = `<i class="${iconClass}"></i><span class="tooltip">${tooltipText}</span>`;
        return button;
    }

    function formatFinishDateText(finishDateClass, finishDate) {
        const labels = {
            inProgress: "Végigjátszás alatt",
            abandoned: "Szüneteltetett",
            pending: "Várakozás az előző rész befejezésére",
            openWorld: "Open World Game",
            mmo: "MMO - Nem befejezhető",
            simulator: "Szimulátor",
            notStarted: "Tervezett végigjátszás",
            completed: `Végigjátszva: ${finishDate}`
        };
        return labels[finishDateClass] || labels.completed;
    }

    function formatPlayTimeText(playTime, finishDateClass) {
        return (finishDateClass === "openWorld" || finishDateClass === "mmo" || finishDateClass === "simulator")
            ? createParagraph('play-time', `Játék idő: ${playTime}`)
            : createParagraph('play-time', `Végigjátszási idő: ${playTime}`);
    }

    function createParagraph(className, text) {
        return `<p class="${className}">${text}</p>`;
    }

    function openVideoModal(videoId) {
        const modal = document.getElementById("videoModal");
        const videoFrame = document.getElementById("videoFrame");
        videoFrame.innerHTML = `<iframe width="1920" height="1080" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen autoplay></iframe>`;
        modal.style.display = "block";
        modal.classList.add("modal-show");

        function closeModal() {
            modal.style.display = "none";
            videoFrame.innerHTML = "";
            modal.classList.remove("modal-show");
        }
        document.querySelectorAll(".close, #videoModal").forEach(button => button.onclick = closeModal);
        window.onkeydown = event => {
            if (event.key === "Escape") closeModal();
        };
    }

    // Fetch games data from JSON file
    fetch('games.json')
        .then(response => response.json())
        .then(data => {
            renderGames(data);
        })
        .catch(error => {
            console.error('Error fetching games:', error);
            document.querySelector('.waitLoadFully').style.display = 'none';
        });

    searchContainer.addEventListener('mouseenter', () => searchContainer.classList.add('expanded'));
    searchContainer.addEventListener('mouseleave', () => {
        if (!searchInput.matches(':focus') && !searchInput.value.trim()) searchContainer.classList.remove('expanded');
    });

    searchInput.addEventListener('focus', () => searchContainer.classList.add('expanded'));
    searchInput.addEventListener('blur', () => {
        if (!searchInput.value.trim()) searchContainer.classList.remove('expanded');
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const games = document.querySelectorAll('.game');
        let hasResults = false;

        sections.forEach(sectionKey => {
            let sectionHasResults = false;

            games.forEach(game => {
                const title = game.getAttribute('data-title');
                const matchesSearch = title.includes(searchTerm);
                game.style.display = matchesSearch ? '' : 'none';

                if (matchesSearch && game.closest('.category-section').id.includes(sectionKey)) {
                    sectionHasResults = true;
                    hasResults = true;
                }
            });

            toggleSectionVisibility(sectionKey, sectionHasResults);
        });

        if (!hasResults || !searchTerm) {
            sections.forEach(sectionKey => toggleSectionVisibility(sectionKey, !searchTerm));
            if (!searchTerm) games.forEach(game => game.style.display = '');
        }
    });
});
