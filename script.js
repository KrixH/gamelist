// A játékok adatainak tömbje
/*

{
    title: "",
    category: "Action, Adventure, Role-playing (RPG)",
    cover: "https://images.igdb.com",
    releaseDate: "",
    finishDate: "",
    playTime: "",
    videoId: "",
  },

*/
//TODO: Ide írd a további játékokat adatait
const games = [
    {
      title: "Alan Wake Remastered",
      category: "Adventure, Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co65aa.png",
      releaseDate: "2021.10.05",
      finishDate: "2023.12.16",
      playTime: "09:20:34",
      videoId: "cF_YGL3W6CE",
    },
    {
      title: "Far Cry",
      category: "Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vpf.webp",
      releaseDate: "2004.03.23",
      finishDate: "VA",
      playTime: "",
      videoId: "occqEcRd6Qg",
    },
    {
      title: "Tomb Raider",
      category: "Shooter, Platform, Puzzle, Adventure",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rbu.webp",
      releaseDate: "2013.03.04",
      finishDate: "2022.01.07",
      playTime: "~12:30:00",
      videoId: "RN7_8Yholm4",
    },
    {
      title: "Elden Ring",
      category: "Role-playing (RPG), Adventure",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
      releaseDate: "2022.02.25",
      finishDate: "VA",
      playTime: "",
      videoId: "l6pCyV7PnqI",
    },
    {
      title: "Firewatch",
      category: "Adventure, Indie",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1m35.webp",
      releaseDate: "2016.02.09",
      finishDate: "VA",
      playTime: "",
      videoId: "HdUYYnfRdl8",
    },
    {
      title: "God of War",
      category: "Adventure, Hack and slash/Beat 'em up, Role-playing (RPG)",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.png",
      releaseDate: "2024.02.08",
      finishDate: "VA",
      playTime: "",
      videoId: "rClXqZD2Xrs",
    },
    {
      title: "NieR: Automata",
      category: "Hack and slash/Beat 'em up, Role-playing (RPG)",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5pcj.png",
      releaseDate: "2017.02.23",
      finishDate: "VA",
      playTime: "",
      videoId: "wJxNhJ8fjFk",
    },
    {
      title: "Counter-Strike: Global Offensive",
      category: "Action, Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6996.png",
      releaseDate: "2012.08.21",
      finishDate: "",
      playTime: "2 624 óra",
      videoId: "edYCtaNueQY",
    },
    {
      title: "Cyberpunk 2077",
      category: "Adventure, Role-playing (RPG), Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7497.png",
      releaseDate: "2020.12.10",
      finishDate: "VA",
      playTime: "",
      videoId: "8X2kIfS6fb8",
    },
    {
      title: "Control",
      category: "Action, Adventure",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2evj.png",
      releaseDate: "2019.08.27",
      finishDate: "VA",
      playTime: "",
      videoId: "-oXCMFX9H8g",
    },
    {
      title: "Detroit: Become Human",
      category: "Adventure, Puzzle",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6mzf.png",
      releaseDate: "2018.05.25",
      finishDate: "VA",
      playTime: "",
      videoId: "8a-EObAhYrg",
    },
    {
      title: "Doom",
      category: "Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5rav.webp",
      releaseDate: "1993.12.10",
      finishDate: "2024.05.11",
      playTime: "01:09:00",
      videoId: "BkaC1-QoraY",
    },
    {
      title: "Dying Light",
      category: "Adventure, Role-playing (RPG), Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co65yq.webp",
      releaseDate: "2015. 01. 26",
      finishDate: "2024.05.25",
      playTime: "18:10:45",
      videoId: "u4-FCsiF5x4",
    },
    {
      title: "High on Life",
      category: "Adventure, Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co67qo.webp",
      releaseDate: "2022.12.13",
      finishDate: "2023.07.17",
      playTime: "07:50:25",
      videoId: "7SUUeakHKTk",
    },
    {
      title: "High on Life: High on Knife",
      category: "Adventure, Shooter",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6mao.webp",
      releaseDate: "2023.10.03",
      finishDate: "2024.06.09",
      playTime: "Ismeretlen",
      videoId: "Wwkpa5OfSvk",
    },
    {
        title: "Grand Theft Auto V",
        category: "Shooter, Racing, Adventure",
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp",
        releaseDate: "2013.09.17",
        finishDate: "2017.12.13",
        playTime: "Ismeretlen",
        videoId: "QkkoHAzjnUs",
      },
      {
        title: "Grand Theft Auto: San Andreas",
        category: "Shooter, Racing, Adventure",
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lb9.webp",
        releaseDate: "2004.10.26",
        finishDate: "Ismeretlen",
        playTime: "Ismeretlen",
        videoId: "J6-UokQene8",
      },
      {
        title: "Red Dead Redemption 2",
        category: "Adventure, Role-playing (RPG), Shooter",
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
        releaseDate: "2018.10.26",
        finishDate: "2024.06.12",
        playTime: "Ismeretlen",
        videoId: "iqaipBpnVRE",
      },
  ];

  document.addEventListener("DOMContentLoaded", () => {
    const gameList = document.getElementById("gameList");
    const loadingScreen = document.querySelector('.waitLoadFully');
    
    // Betölti a játékokat a DOM-ba
    function renderGames() {
        gameList.innerHTML = '';  // Tisztítja a játéklistát
        
        games
            .filter(game => game.finishDate || game.finishDate === "VA")
            .sort((a, b) => a.title.localeCompare(b.title))
            .forEach(game => {
                const gameDiv = document.createElement("div");
                gameDiv.classList.add("game");

                gameDiv.innerHTML = `
                    <img src="${game.cover}" alt="${game.title}">
                    <h3>${game.title}</h3>
                    <div class="categories">${game.category.split(",")
                        .map(category => `<div class="category">${category.trim()}</div>`)
                        .join(" ")}</div>
                    <p class="release-date">Megjelenés: <span>${game.releaseDate}</span></p>
                    ${game.finishDate ? 
                        `<p class="finish-date">${game.finishDate.includes("VA") ? 
                            `<span class="in-progress">Végigjátszás alatt</span>` : 
                            `Végigjátszva: <span>${game.finishDate}</span>`
                        }</p>` : 
                        ``
                    }
                    ${game.playTime ? `<p class="play-time">Végigjátszási idő: <span>${game.playTime}</span></p>` : ""}
                `;

                gameDiv.querySelector("img").addEventListener("click", () => openVideoModal(game.videoId));
                gameList.appendChild(gameDiv);
            });

        loadingScreen.style.display = 'none';  // Elrejti a töltőképernyőt
    }

    // Megnyitja a videó modális ablakot
    function openVideoModal(videoId) {
        const modal = document.getElementById("videoModal");
        const videoFrame = document.getElementById("videoFrame");
        videoFrame.innerHTML = `<iframe width="1120" height="630" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen autoplay></iframe>`;
        modal.style.display = "block";

        function closeModal() {
            modal.style.display = "none";
            videoFrame.innerHTML = "";
        }

        document.querySelectorAll(".close, #videoModal").forEach(button => button.onclick = closeModal);
        window.onkeydown = event => { if (event.key === "Escape") closeModal(); };
    }

    // Inicializálja a játékokat
    renderGames();

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
});
