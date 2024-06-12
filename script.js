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
      title: "God of War",
      category: "Adventure, Hack and slash/Beat 'em up, Role-playing (RPG)",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.png",
      releaseDate: "2024.02.08",
      finishDate: "",
      playTime: "",
      videoId: "rClXqZD2Xrs",
    },
    {
      title: "NieR: Automata",
      category: "Hack and slash/Beat 'em up, Role-playing (RPG)",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5pcj.png",
      releaseDate: "2017.02.23",
      finishDate: "",
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
      finishDate: "",
      playTime: "",
      videoId: "8X2kIfS6fb8",
    },
    {
      title: "Control",
      category: "Action, Adventure",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2evj.png",
      releaseDate: "2019.08.27",
      finishDate: "",
      playTime: "",
      videoId: "-oXCMFX9H8g",
    },
    {
      title: "Detroit: Become Human",
      category: "Adventure, Puzzle",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6mzf.png",
      releaseDate: "2018.05.25",
      finishDate: "",
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
      playTime: "",
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
        videoId: "vdlpWZpwOq0",
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

  document.addEventListener("DOMContentLoaded", function () {
    const gameList = document.getElementById("gameList");

    // Játékok rendezése betűrendbe
    games.sort((a, b) => a.title.localeCompare(b.title));

    // Játékok betöltése az oldalra
    games.forEach((game) => {
        // Csak akkor hoz létre és jelenít meg egy játékot, ha van finishDate értéke
        if (game.finishDate) {
            const gameDiv = document.createElement("div");
            gameDiv.classList.add("game");
            gameDiv.innerHTML = `
                <img src="${game.cover}" alt="${game.title}">
                <h3>${game.title}</h3>
                <div class="categories">${game.category
                    .split(",")
                    .map((category) => `<div class="category">${category.trim()}</div>`)
                    .join(" ")}</div>
                <p class="release-date">Megjelenés: ${game.releaseDate}</p>
                <p class="finish-date">Végigjátszva: ${game.finishDate}</p>
                ${game.playTime ? `<p class="play-time">Végigjátszási idő: ${game.playTime}</p>` : ""}
            `;
            const coverImage = gameDiv.querySelector("img");
            coverImage.addEventListener("click", function () {
                openVideoModal(game.videoId);
            });
            gameList.appendChild(gameDiv);
        // Stílusok beállítása a kategóriákhoz
        const categoryDivs = gameDiv.querySelectorAll(".categories .category");
        categoryDivs.forEach((div, index) => {
            div.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            div.style.padding = "2px";
            div.style.fontFamily = "Calibri, sans-serif";
            div.style.display = "inline-block"; // Kategória div-ek egymás mellett
            if (index < categoryDivs.length - 1) {
                div.style.marginRight = "5px"; // Kis hely hagyása a kategóriák között
            }
        });

        }
    });

    // Videó modal megnyitása
    function openVideoModal(videoId) {
        const modal = document.getElementById("videoModal");
        const videoFrame = document.getElementById("videoFrame");
        videoFrame.innerHTML = `<iframe width="1120" height="630" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen autoplay></iframe>`;
        modal.style.display = "block";
        modal.classList.add("modal-show"); // Hozzáadunk egy animációt a modális ablak megjelenéséhez

        const closeModal = document.getElementsByClassName("close")[0];
        closeModal.onclick = function () {
            modal.style.display = "none";
            videoFrame.innerHTML = "";
            modal.classList.remove("modal-show"); // Elvesszünk egy animációt a modális ablak megjelenéséhez
        };

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
                videoFrame.innerHTML = "";
                modal.classList.remove("modal-show"); // Elvesszünk egy animációt a modális ablak megjelenéséhez
            }
        };

        // Modal bezárása Esc billentyű lenyomására
        window.onkeydown = function (event) {
            if (event.key === "Escape") {
                modal.style.display = "none";
                videoFrame.innerHTML = "";
                modal.classList.remove("modal-show"); // Elvesszünk egy animációt a modális ablak megjelenéséhez
            }
        };
    }
});
