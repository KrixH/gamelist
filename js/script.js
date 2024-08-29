document.addEventListener("DOMContentLoaded", () => {
    const sections = ["inProgress", "completed", "openWorld", "mmo", "abandoned", "pending", "simulator"];
    let remainingGames = [];
    let remainingSections = new Set(sections);

    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('gameSearch');

    function renderGamesOnScroll() {
        const scrollPosition = window.scrollY + window.innerHeight;
        remainingSections.forEach(sectionKey => {
            const sectionElement = document.getElementById(`${sectionKey}Section`);
            if (sectionElement && sectionElement.offsetTop < scrollPosition) {
                renderGamesForSection(sectionKey);
                remainingSections.delete(sectionKey);
            }
        });
    }

    function renderGames(games) {
        remainingGames = games;
        renderGamesOnScroll();
    }

    function renderGamesForSection(sectionKey) {
        const sectionElement = document.getElementById(`${sectionKey}Games`);
        sectionElement.innerHTML = '';

        const sectionGames = remainingGames.filter(game => determineSectionKey(game.finishDate) === sectionKey).sort((a, b) => a.title.localeCompare(b.title));

        toggleSectionVisibility(sectionKey, sectionGames.length > 0);
        if (sectionGames.length > 0) {
            loadGamesOneByOne(sectionGames, sectionElement);
            remainingGames = remainingGames.filter(game => !sectionGames.includes(game));
        }
    }

    function toggleSectionVisibility(sectionKey, isVisible) {
        document.getElementById(`${sectionKey}Section`).style.display = isVisible ? 'block' : 'none';
        document.getElementById(`${sectionKey}Header`).style.display = isVisible ? 'block' : 'none';
    }

    function loadGamesOneByOne(games, sectionElement) {
        games.forEach((game, index) => {
            setTimeout(() => {
                const gameDiv = createGameDiv(game);
                sectionElement.appendChild(gameDiv);
                setTimeout(() => gameDiv.classList.add('show'), 100);
            }, index * 300);
        });
    }

    function determineSectionKey(finishDate) {
        if (finishDate.includes("VA")) return "inProgress";
        if (finishDate.includes("AH")) return "abandoned";
        if (finishDate.includes("P")) return "pending";
        if (finishDate.includes("OW")) return "openWorld";
        if (finishDate.includes("MMO")) return "mmo";
        if (finishDate.includes("SIM")) return "simulator";
        return "completed";
    }

    function createGameDiv(game) {
        const finishDateClass = determineSectionKey(game.finishDate);
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game');
        gameDiv.setAttribute('data-title', game.title.toLowerCase());
        gameDiv.innerHTML = `
            <div class="game-content">
                <img src="${game.cover}" alt="${game.title}">
                <h3>${game.title}</h3>
                <div class="categories">${game.category.split(",").map(createCategoryElement).join("")}</div>
                ${game.earlyAccess ? createParagraph("early-access", `Korai hozzáférés: ${game.earlyAccess}`) : ''}
                ${game.releaseDate ? createParagraph("release-date", `Teljes megjelenés: ${game.releaseDate}`) : ''}
                <p class="finish-date ${finishDateClass}">${formatFinishDateText(finishDateClass, game.finishDate)}</p>
                ${game.playTime ? formatPlayTimeText(game.playTime, finishDateClass) : ''}
            </div>
        `;

        const buttonContainer = createButtonContainer(game);
        if (buttonContainer) gameDiv.appendChild(buttonContainer);

        return gameDiv;
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
            completed: `Végigjátszva: ${finishDate}`
        };
        return labels[finishDateClass] || labels.completed;
    }

    function formatPlayTimeText(playTime, finishDateClass) {
        return (finishDateClass === "openWorld" || finishDateClass === "mmo")
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

    fetch('games.json')
        .then(response => response.json())
        .then(data => {
            renderGames(data);
            window.addEventListener('scroll', renderGamesOnScroll);
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
            sections.forEach(sectionKey => toggleSectionVisibility(sectionKey, searchTerm ? false : true));
            if (!searchTerm) games.forEach(game => game.style.display = '');
        }
    });

    document.addEventListener('click', event => {
        if (!searchContainer.contains(event.target) && !searchInput.matches(':focus') && !searchInput.value.trim()) {
            searchContainer.classList.remove('expanded');
        }
    });
});
