document.addEventListener("DOMContentLoaded", () => {
    const sections = {
        inProgress: "inProgress",
        completed: "completed",
        openWorld: "openWorld",
        mmo: "mmo",
        abandoned: "abandoned",
        pending: "pending",
        simulator: "simulator"
    };

    const loadingScreen = document.querySelector('.waitLoadFully');

    function renderGames(games) {
        Object.values(sections).forEach(section => {
            document.getElementById(`${section}Games`).innerHTML = '';
        });

        const fragments = Object.keys(sections).reduce((acc, key) => {
            acc[key] = document.createDocumentFragment();
            return acc;
        }, {});

        games.sort((a, b) => a.title.localeCompare(b.title)).forEach(game => {
            const gameDiv = createGameDiv(game);
            const sectionKey = determineSectionKey(game.finishDate);
            fragments[sectionKey].appendChild(gameDiv);
        });

        Object.keys(sections).forEach(key => {
            const sectionElement = document.getElementById(`${key}Section`);
            const headerElement = document.getElementById(`${key}Header`);
            if (fragments[key].children.length > 0) {
                document.getElementById(`${key}Games`).appendChild(fragments[key]);
                headerElement.style.display = 'block';
                sectionElement.style.display = 'block';
            } else {
                headerElement.style.display = 'none';
                sectionElement.style.display = 'none';
            }
        });

        loadingScreen.style.display = 'none';
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
        const gameDiv = document.createElement("div");
        gameDiv.classList.add("game");

        const finishDateClass = determineSectionKey(game.finishDate);
        const finishDateText = formatFinishDateText(game.finishDate);
        const playTimeText = game.playTime ? formatPlayTimeText(game.playTime, finishDateClass) : '';
        const earlyAccessText = game.earlyAccess ? `<p class="early-access">Korai hozzáférés: <span>${game.earlyAccess}</span></p>` : '';
        const releaseDateText = game.releaseDate ? `<p class="release-date">Teljes megjelenés: <span>${game.releaseDate}</span></p>` : '';

        gameDiv.innerHTML = `
            <div class="game-content">
                <img src="${game.cover}" alt="${game.title}">
                <h3>${game.title}</h3>
                <div class="categories">${game.category.split(",").map(category => `<div class="category">${category.trim()}</div>`).join(" ")}</div>
                ${earlyAccessText}
                ${releaseDateText}
                <p class="finish-date ${finishDateClass}">${finishDateText}</p>
                ${playTimeText}
            </div>
            <div class="button-container">
                <a href="https://store.steampowered.com/app/${game.steamId}" class="steam-button" target="_blank">
                    <i class="fab fa-steam"></i><span class="tooltip">Steam webáruház</span>
                </a>
                <button class="youtube-button">
                    <i class="fab fa-youtube"></i><span class="tooltip">Trailer videó</span>
                </button>
            </div>
        `;

        gameDiv.querySelector(".youtube-button").addEventListener("click", () => openVideoModal(game.videoId));

        return gameDiv;
    }

    function formatFinishDateText(finishDate) {
        switch (determineSectionKey(finishDate)) {
            case "inProgress":
                return "Végigjátszás alatt";
            case "abandoned":
                return "Szüneteltetett";
            case "pending":
                return "Várakozás az előző rész befejezésére";
            case "openWorld":
                return "Open World Game";
            case "mmo":
                return "MMO - Nem befejezhető";
            case "simulator":
                return "Szimulator";
            default:
                return `Végigjátszva: ${finishDate}`;
        }
    }

    function formatPlayTimeText(playTime, finishDateClass) {
        return (finishDateClass === "open-world" || finishDateClass === "mmo") 
            ? `<p class="play-time">Játék idő: <span>${playTime}</span></p>`
            : `<p class="play-time">Végigjátszási idő: <span>${playTime}</span></p>`;
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
        .then(data => renderGames(data))
        .catch(error => {
            console.error('Error fetching games:', error);
            loadingScreen.style.display = 'none';
        });
});
