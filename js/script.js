document.addEventListener("DOMContentLoaded", () => {
    const sections = {
        inProgress: {
            gamesElement: document.getElementById("inProgressGames"),
            headerElement: document.getElementById("inProgressHeader"),
            sectionElement: document.getElementById("inProgressSection")
        },
        completed: {
            gamesElement: document.getElementById("completedGames"),
            headerElement: document.getElementById("completedHeader"),
            sectionElement: document.getElementById("completedSection")
        },
        openWorld: {
            gamesElement: document.getElementById("openWorldGames"),
            headerElement: document.getElementById("openWorldHeader"),
            sectionElement: document.getElementById("openWorldSection")
        },
        mmo: {
            gamesElement: document.getElementById("mmoGames"),
            headerElement: document.getElementById("mmoHeader"),
            sectionElement: document.getElementById("mmoSection")
        },
        abandoned: { 
            gamesElement: document.getElementById("abandonedGames"),
            headerElement: document.getElementById("abandonedHeader"),
            sectionElement: document.getElementById("abandonedSection")
        },
        pending: {
            gamesElement: document.getElementById("pendingGames"),
            headerElement: document.getElementById("pendingHeader"),
            sectionElement: document.getElementById("pendingSection")
        }
    };

    const loadingScreen = document.querySelector('.waitLoadFully');

    function renderGames(games) {
        Object.values(sections).forEach(section => {
            section.gamesElement.innerHTML = '';
        });

        const fragments = {
            inProgress: document.createDocumentFragment(),
            completed: document.createDocumentFragment(),
            openWorld: document.createDocumentFragment(),
            mmo: document.createDocumentFragment(),
            abandoned: document.createDocumentFragment(),
            pending: document.createDocumentFragment()
        };

        games
            .sort((a, b) => a.title.localeCompare(b.title))
            .forEach(game => {
                const gameDiv = createGameDiv(game);

                if (game.finishDate.includes("VA")) {
                    fragments.inProgress.appendChild(gameDiv);
                } else if (game.finishDate.includes("AH")) {
                    fragments.abandoned.appendChild(gameDiv);
                } else if (game.finishDate.includes("P")) {
                    fragments.pending.appendChild(gameDiv);
                } else if (game.finishDate.includes("OW")) {
                    fragments.openWorld.appendChild(gameDiv);
                } else if (game.finishDate.includes("MMO")) {
                    fragments.mmo.appendChild(gameDiv);
                } else {
                    fragments.completed.appendChild(gameDiv);
                }
            });

        Object.keys(sections).forEach(key => {
            const section = sections[key];
            const fragment = fragments[key];

            if (fragment.children.length > 0) {
                section.gamesElement.appendChild(fragment);
                section.headerElement.style.display = 'block';
                section.sectionElement.style.display = 'block';
            } else {
                section.headerElement.style.display = 'none';
                section.sectionElement.style.display = 'none';
            }
        });

        loadingScreen.style.display = 'none';
    }

    function createGameDiv(game) {
        const gameDiv = document.createElement("div");
        gameDiv.classList.add("game");
    
        let finishDateText = "";
        let finishDateClass = "";
    
        if (game.finishDate.includes("VA")) {
            finishDateText = "Végigjátszás alatt";
            finishDateClass = "in-progress";
        } else if (game.finishDate.includes("AH")) {
            finishDateText = "Szüneteltetett";
            finishDateClass = "abandoned";
        } else if (game.finishDate.includes("P")) {
            finishDateText = "Várakozás az előző rész befejezésére";
            finishDateClass = "pending";
        } else if (game.finishDate.includes("OW")) {
            finishDateText = "Open World Game";
            finishDateClass = "open-world";
        } else if (game.finishDate.includes("MMO")) {
            finishDateText = "MMO - Nem befejezhető";
            finishDateClass = "mmo";
        } else {
            finishDateText = `Végigjátszva: ${game.finishDate}`;
            finishDateClass = "finished";
        }
    
        let playTimeText = "";
        if (game.playTime) {
            if (game.finishDate.includes("OW") || game.finishDate.includes("MMO")) {
                playTimeText = `<p class="play-time">Játék idő: <span>${game.playTime}</span></p>`;
            } else {
                playTimeText = `<p class="play-time">Végigjátszási idő: <span>${game.playTime}</span></p>`;
            }
        }
    
        let earlyAccessText = "";
        if (game.earlyAccess) {
            earlyAccessText = `<p class="early-access">Korai hozzáférés: <span>${game.earlyAccess}</span></p>`;
        }
    
        let releaseDateText = "";
        if (game.releaseDate) {
            releaseDateText = `<p class="release-date">Teljes megjelenés: <span>${game.releaseDate}</span></p>`;
        }
    
        gameDiv.innerHTML = `
            <img src="${game.cover}" alt="${game.title}">
            <h3>${game.title}</h3>
            <div class="categories">${game.category.split(",")
                .map(category => `<div class="category">${category.trim()}</div>`)
                .join(" ")}</div>
            ${earlyAccessText}
            ${releaseDateText}
            <p class="finish-date ${finishDateClass}">${finishDateText}</p>
            ${playTimeText}
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
    fetch('games.json')
        .then(response => response.json())
        .then(data => {
            renderGames(data);
        })
        .catch(error => {
            console.error('Error fetching games:', error);
            loadingScreen.style.display = 'none';  // Elrejti a töltőképernyőt hiba esetén
        });
});