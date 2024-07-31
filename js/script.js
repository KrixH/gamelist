document.addEventListener("DOMContentLoaded", () => {
    const inProgressGames = document.getElementById("inProgressGames");
    const completedGames = document.getElementById("completedGames");
    const loadingScreen = document.querySelector('.waitLoadFully');

    // Betölti a játékokat a DOM-ba
    function renderGames(games) {
        inProgressGames.innerHTML = '';  // Tisztítja a "Végigjátszás alatt" kategóriát
        completedGames.innerHTML = '';   // Tisztítja a "Befejezett játékok" kategóriát

        const fragmentInProgress = document.createDocumentFragment();
        const fragmentCompleted = document.createDocumentFragment();

        games
            .filter(game => game.finishDate || game.finishDate === "VA")
            .sort((a, b) => a.title.localeCompare(b.title))
            .forEach(game => {
                const gameDiv = createGameDiv(game);
                
                if (game.finishDate === "VA") {
                    fragmentInProgress.appendChild(gameDiv);
                } else {
                    fragmentCompleted.appendChild(gameDiv);
                }
            });

        inProgressGames.appendChild(fragmentInProgress);
        completedGames.appendChild(fragmentCompleted);
        loadingScreen.style.display = 'none';  // Elrejti a töltőképernyőt
    }

    // Létrehozza a játék div elemet
    function createGameDiv(game) {
        const gameDiv = document.createElement("div");
        gameDiv.classList.add("game");

        gameDiv.innerHTML = `
            <img src="${game.cover}" alt="${game.title}">
            <h3>${game.title}</h3>
            <div class="categories">${game.category.split(",")
                .map(category => `<div class="category">${category.trim()}</div>`)
                .join(" ")}</div>
            <p class="release-date">Megjelenés: <span>${game.releaseDate}</span></p>
            ${game.finishDate ? `
                <p class="finish-date">${game.finishDate.includes("VA") ? 
                    `<span class="in-progress">Végigjátszás alatt</span>` : 
                    `Végigjátszva: <span>${game.finishDate}</span>`}</p>` : ""}
            ${game.playTime ? `<p class="play-time">Végigjátszási idő: <span>${game.playTime}</span></p>` : ""}
        `;

        gameDiv.querySelector("img").addEventListener("click", () => openVideoModal(game.videoId));
        return gameDiv;
    }

    // Megnyitja a videó modális ablakot
    function openVideoModal(videoId) {
        const modal = document.getElementById("videoModal");
        const videoFrame = document.getElementById("videoFrame");
        videoFrame.innerHTML = `<iframe width="1120" height="630" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen autoplay></iframe>`;
        modal.style.display = "block";
        modal.classList.add("modal-show");

        function closeModal() {
            modal.style.display = "none";
            videoFrame.innerHTML = "";
            modal.classList.remove("modal-show");
        }

        const closeButtons = document.querySelectorAll(".close, #videoModal");
        closeButtons.forEach(button => button.onclick = closeModal);

        window.onkeydown = function (event) {
            if (event.key === "Escape") {
                closeModal();
            }
        };
    }

    // AJAX kérés a játékok adatainak beolvasásához
    fetch('../json/games.json')
        .then(response => response.json())
        .then(data => {
            renderGames(data);
        })
        .catch(error => {
            console.error('Error fetching games:', error);
            loadingScreen.style.display = 'none';  // Elrejti a töltőképernyőt hiba esetén
        });
});
