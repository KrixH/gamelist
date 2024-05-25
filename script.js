// A játékok adatainak tömbje rendezve betűrendbe
//TODO: Ide írd a további játékokat adatait
const games = [
    { title: "Alan Wake Remastered", category: "Adventure, Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co65aa.png", releaseDate: "2021.10.05", finishDate: "2023.12.16.", videoId: "cF_YGL3W6CE" },
    { title: "Assassin's Creed Valhalla", category: "Action, Adventure, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ed3.png", releaseDate: "2020.11.10", finishDate: "", videoId: "rKjUAWlbTJk" },
    { title: "God of War", category: "Adventure, Hack and slash/Beat 'em up, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.png", releaseDate: "2024.02.08", finishDate: "", videoId: "rClXqZD2Xrs" },
    { title: "The Legend of Zelda: Breath of the Wild", category: "Adventure, Puzzle, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.png", releaseDate: "2017.03.03", finishDate: "", videoId: "zw47_q9wbBE" },
    { title: "The Last of Us Part II", category: "Adventure, Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5ziw.png", releaseDate: "2020.06.19", finishDate: "", videoId: "vhII1qlcZ4E" },
    { title: "Horizon Zero Dawn", category: "Adventure, Role-playing (RPG), Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2una.png", releaseDate: "2017.02.28", finishDate: "", videoId: "u4-FCsiF5x4" },
    { title: "Marvel's Spider-Man", category: "Adventure, Hack and slash/Beat 'em up", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r77.png", releaseDate: "2018.09.07", finishDate: "", videoId: "q4GdJVvdxss" },
    { title: "Bloodborne", category: "Action, Adventure", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rba.png", releaseDate: "2015.03.24", finishDate: "", videoId: "2Crk_GpxGQE" },
    { title: "Uncharted 4: A Thief's End", category: "Adventure, Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7h.png", releaseDate: "2016.05.10", finishDate: "", videoId: "hh5HV4iic1Y" },
    { title: "Death Stranding", category: "Adventure, Role-playing (RPG), Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vq8.png", releaseDate: "2019.11.08", finishDate: "", videoId: "tCI396HyhbQ" },
    { title: "Dark Souls III", category: "Adventure, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vcf.png", releaseDate: "2016.04.12", finishDate: "", videoId: "cWBwFhUv1-8" },
    { title: "Shadow of the Colossus", category: "Adventure, Platform, Puzzle", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co272w.png", releaseDate: "2018.02.06", finishDate: "", videoId: "pdZQ98mWeto" },
    { title: "The Elder Scrolls V: Skyrim", category: "Adventure, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.png", releaseDate: "2011.11.10", finishDate: "", videoId: "JSRtYpNRoN0" },
    { title: "Final Fantasy VII Remake", category: "Adventure, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1qxr.png", releaseDate: "2020.04.10", finishDate: "", videoId: "sz9QWTcbXYE" },
    { title: "Metal Gear Solid V: The Phantom Pain", category: "Adventure, Shooter, Tactica", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v85.png", releaseDate: "2015.09.01", finishDate: "", videoId: "C19ap2M7DDE" },
    { title: "NieR: Automata", category: "Hack and slash/Beat 'em up, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5pcj.png", releaseDate: "2017.02.23", finishDate: "", videoId: "wJxNhJ8fjFk" },
    { title: "The Last Guardian", category: "Adventure, Platform, Puzzle", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co271e.png", releaseDate: "2016.12.06", finishDate: "", videoId: "4cDuKShhQOA" },
    { title: "Demon's Souls", category: "Adventure, Role-playing (RPG)", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2kj9.png", releaseDate: "2020.11.12", finishDate: "", videoId: "qjZIw0VUezU" },
    { title: "Call of Duty: Modern Warfare", category: "Action, Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rsg.png", releaseDate: "2019.10.25", finishDate: "", videoId: "bH1lHCirCGI" },
    { title: "Counter-Strike: Global Offensive", category: "Action, Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6996.png", releaseDate: "2012.08.21", finishDate: "", videoId: "edYCtaNueQY" },
    { title: "Cyberpunk 2077", category: "Adventure, Role-playing (RPG), Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7497.png", releaseDate: "2020.12.10", finishDate: "", videoId: "8X2kIfS6fb8" },
    { title: "Crash Bandicoot N. Sane Trilogy", category: "Platform, Adventure", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v62.png", releaseDate: "2017.06.30", finishDate: "", videoId: "F7G91RjVmvk" },
    { title: "Control", category: "Action, Adventure", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2evj.png", releaseDate: "2019.08.27", finishDate: "", videoId: "-oXCMFX9H8g" },
    { title: "Cuphead", category: "Platform, Shooter, Arcade, Indie", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co65ip.png", releaseDate: "2017.09.29", finishDate: "", videoId: "bE6ZeClM6uI" },
    { title: "Crash Team Racing Nitro-Fueled", category: "Racing", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2wvy.png", releaseDate: "2019.06.21", finishDate: "", videoId: "dr2BCMRk_xc" },
    { title: "Celeste", category: "Platform, Adventure", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3byy.png", releaseDate: "2018.01.25", finishDate: "", videoId: "70d9irlxiB4" },
    { title: "Control Ultimate Edition", category: "Action, Adventure", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ewb.png", releaseDate: "2020.08.27", finishDate: "", videoId: "UISRDU_mzaw" },
    { title: "Crash Bandicoot 4: It's About Time", category: "Platform, Adventure", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2hp4.png", releaseDate: "2020.10.02", finishDate: "", videoId: "375dqL15O9E" },
    { title: "Detroit: Become Human", category: "Adventure, Puzzle", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6mzf.png", releaseDate: "2018.05.25", finishDate: "", videoId: "8a-EObAhYrg" },
    { title: "Doom", category: "Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5rav.webp", releaseDate: "1993.12.10", finishDate: "2024.05.11", videoId: "BkaC1-QoraY" },
    { title: "Dying Light", category: "Adventure, Role-playing (RPG), Shooter", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co65yq.webp", releaseDate: "2015. 01. 26", finishDate: "2024.05.25", videoId: "u4-FCsiF5x4" },

];

games.sort((a, b) => a.title.localeCompare(b.title));

document.addEventListener("DOMContentLoaded", function() {
    const gameList = document.getElementById("gameList");

    games.forEach(game => {
        // Csak akkor hoz létre és jelenít meg egy játékot, ha van finishDate értéke
        if (game.finishDate) {
            const gameDiv = document.createElement("div");
            gameDiv.classList.add("game");
            gameDiv.innerHTML = `
                <img src="${game.cover}" alt="${game.title}">
                <h3>${game.title}</h3>
                <div class="categories">${game.category.split(",").map(category => `<p><span>${category.trim()}</span></p>`).join("")}</div>
                <p class="release-date">Megjelenés: ${game.releaseDate}</p>
                <p class="finish-date">Végigjátszva: ${game.finishDate}</p>
            `;
            const coverImage = gameDiv.querySelector('img');
            coverImage.addEventListener("click", function() {
                openVideoModal(game.videoId);
            });
            gameList.appendChild(gameDiv);

            const categorySpans = gameDiv.querySelectorAll('.categories span');
            categorySpans.forEach(span => {
                span.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                span.style.padding = '5px';
                span.style.fontFamily = 'Calibri, sans-serif';
            });
        }
    });

    function openVideoModal(videoId) {
        const modal = document.getElementById("videoModal");
        const videoFrame = document.getElementById("videoFrame");
        videoFrame.innerHTML = `<iframe width="1120" height="630" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen autoplay></iframe>`;
        modal.style.display = "block";
        modal.classList.add("modal-show");

        const closeModal = document.getElementsByClassName("close")[0];
        closeModal.onclick = function() {
            modal.style.display = "none";
            videoFrame.innerHTML = "";
            modal.classList.remove("modal-show");
        };

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                videoFrame.innerHTML = "";
                modal.classList.remove("modal-show");
            }
        };

        window.onkeydown = function(event) {
            if (event.key === "Escape") {
                modal.style.display = "none";
                videoFrame.innerHTML = "";
                modal.classList.remove("modal-show");
            }
        };
    }
});


//FIXME:
// Weblap vizsgálat letiltó cucc
document.addEventListener('contextmenu', (e) => e.preventDefault());

function ctrlShiftKey(e, keyCode) {
  return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
}

document.onkeydown = (e) => {
  // F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
  if (
    event.keyCode === 123 ||
    ctrlShiftKey(e, 'I') ||
    ctrlShiftKey(e, 'J') ||
    ctrlShiftKey(e, 'C') ||
    (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
  )
    return false;
};
