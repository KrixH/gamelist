document.addEventListener("DOMContentLoaded", () => {
    // Ellenőrizze az ablak szélességét és alkalmazza a megfelelő stílusokat
    if (window.innerWidth <= 768) {
        const buttons = document.querySelectorAll('.button-container');
        buttons.forEach(buttonContainer => {
            buttonContainer.style.bottom = '10px';
            buttonContainer.style.right = '10px';
            buttonContainer.style.top = 'auto';
            buttonContainer.style.left = 'auto';
            buttonContainer.style.flexDirection = 'row'; // Gombok egymás mellett
            buttonContainer.style.justifyContent = 'flex-end'; // Jobbra igazítás
        });
    }

    const sections = [
        "inProgress", "completed", "openWorld", "mmo", 
        "abandoned", "pending", "simulator"
    ];

    let remainingGames = [];
    let remainingSections = new Set(sections);

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
        renderGamesOnScroll(); // Induláskor renderelés a látható szekciókra
    }

    function renderGamesForSection(sectionKey) {
        const sectionElement = document.getElementById(`${sectionKey}Games`);
        sectionElement.innerHTML = ''; // Régi tartalom törlése

        const sectionGames = remainingGames
            .filter(game => determineSectionKey(game.finishDate) === sectionKey)
            .sort((a, b) => a.title.localeCompare(b.title));

        if (sectionGames.length > 0) {
            document.getElementById(`${sectionKey}Header`).style.display = 'block';
            document.getElementById(`${sectionKey}Section`).style.display = 'block';

            loadGamesOneByOne(sectionGames, sectionElement);
        } else {
            document.getElementById(`${sectionKey}Header`).style.display = 'none';
            document.getElementById(`${sectionKey}Section`).style.display = 'none';
        }

        remainingGames = remainingGames.filter(game => !sectionGames.includes(game));
    }

    function loadGamesOneByOne(games, sectionElement) {
        let index = 0;

        function showNextGame() {
            if (index < games.length) {
                const gameDiv = createGameDiv(games[index]);
                sectionElement.appendChild(gameDiv);
                setTimeout(() => gameDiv.classList.add('show'), 100);

                index++;
                setTimeout(showNextGame, 300);
            }
        }

        showNextGame();
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
        const finishDateText = formatFinishDateText(finishDateClass, game.finishDate);
        const playTimeText = game.playTime ? formatPlayTimeText(game.playTime, finishDateClass) : '';
        const earlyAccessText = game.earlyAccess ? createParagraph("early-access", `Korai hozzáférés: ${game.earlyAccess}`) : '';
        const releaseDateText = game.releaseDate ? createParagraph("release-date", `Teljes megjelenés: ${game.releaseDate}`) : '';

        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game');
        gameDiv.innerHTML = `
            <div class="game-content">
                <img src="${game.cover}" alt="${game.title}">
                <h3>${game.title}</h3>
                <div class="categories">${game.category.split(",").map(category => createCategoryElement(category)).join("")}</div>
                ${earlyAccessText}
                ${releaseDateText}
                <p class="finish-date ${finishDateClass}">${finishDateText}</p>
                ${playTimeText}
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
        return finishDateClass === "open-world" || finishDateClass === "mmo"
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
        window.onkeydown = function (event) {
            if (event.key === "Escape") closeModal();
        };
    }

    // AJAX kérés a játékok adatainak beolvasásához
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
});
