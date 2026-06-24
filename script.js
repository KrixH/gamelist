document.addEventListener("DOMContentLoaded", init);

const CONFIG = {
  fallbackImage: "https://i.imgur.com/RH2EguE.png",
  youtubeEmbedUrl: "https://www.youtube.com/embed/",
};

function init() {
  const gamesContainer = document.getElementById("gamesContainer");
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const developerSelect = document.getElementById("developerSelect");
  const statusSelect = document.getElementById("statusSelect");
  const trailerModal = document.getElementById("trailerModal");
  const trailerFrame = document.getElementById("trailerFrame");
  const modalClose = document.querySelector(".close");
  let gamesData = [];
  let preprocessedData = {};

  // ─── GOLYÓÁLLÓ ADATBETÖLTÉS ÉS AUTOMATIKUS MIGRÁCIÓ ─────────────────────────

  async function loadGames() {
    try {
      const response = await fetch("games.json");
      if (!response.ok) throw new Error(`Szerver hiba: ${response.status}`);
      
      const text = await response.text();
      const fixedText = text.replace(/,\s*([\]}])/g, "$1");
      const data = JSON.parse(fixedText);
      
      gamesData = data.games.map((game) => {
        const stores = game.stores || {};
        let upToDateGame = {
          nonCompletable: false,
          progress: null,
          category: Array.isArray(game.category) ? game.category : game.category ? [game.category] : ["Egyéb"],
          platforms: Array.isArray(game.platforms) ? game.platforms : game.platforms ? [game.platforms] : [],
          developer: Array.isArray(game.developer) ? game.developer : game.developer ? [game.developer] : [],
          releaseDates: Array.isArray(game.releaseDates) ? game.releaseDates.filter((r) => r !== null && r !== undefined) : [],
          steamId: game.steamId || stores.steam || "",
          playstationStoreId: game.playstationStoreId || stores.playstation?.id || "",
          playstationStoreType: game.playstationStoreType || stores.playstation?.type || "",
          xboxStoreId: game.xboxStoreId || stores.xbox || "",
          nintendoStoreId: game.nintendoStoreId || stores.nintendo || "",
          googlePlayStoreId: game.googlePlayStoreId || stores.googlePlay || "",
          epicGamesId: game.epicGamesId || stores.epicGames || "",
          humbleId: game.humbleId || stores.humble || "",
          itchId: game.itchId || stores.itch || "",
          gogId: game.gogId || stores.gog || "",
          comment: game.comment || "",
          ...game,
        };

        if (Array.isArray(upToDateGame.developmentStatus)) {
          upToDateGame.developmentStatus = upToDateGame.developmentStatus.join(", ");
        }

        if (!Array.isArray(upToDateGame.multiplayer) && upToDateGame.multiplayer) {
          upToDateGame.multiplayer = [upToDateGame.multiplayer];
        }

        if (upToDateGame.releaseDate && (!upToDateGame.releaseDates || upToDateGame.releaseDates.length === 0)) {
          const currentPlatforms = upToDateGame.platforms.length > 0 ? upToDateGame.platforms : ["pc"];
          upToDateGame.releaseDates = currentPlatforms.map((plat) => {
            let platStr = (plat || "").toString().toLowerCase();
            let platClass = "pc";
            if (platStr.includes("playstation") || platStr.includes("ps")) platClass = "ps";
            else if (platStr.includes("xbox")) platClass = "xbox";
            else if (platStr.includes("switch") || platStr.includes("nintendo")) platClass = "switch";
            else if (platStr.includes("linux")) platClass = "linux";
            else if (platStr.includes("mac") || platStr.includes("apple")) platClass = "mac";
            else if (platStr.includes("mobile") || platStr.includes("android") || platStr.includes("ios")) platClass = "mobile";
            return {
              type: upToDateGame.developmentStatus || "full-release",
              platform: platClass,
              date: upToDateGame.releaseDate,
            };
          });
        }

        if (!upToDateGame.releaseDates) {
          upToDateGame.releaseDates = [];
        }

        return upToDateGame;
      });

      preprocessedData = preprocessData(gamesData);
      preloadImages();
      generateFilters(preprocessedData);
      displayGames(gamesData);
      
    } catch (error) {
      console.error("Betöltési hiba:", error);
      // Részletes hibaüzenet, ha a JSON nagyon el van írva
      gamesContainer.innerHTML = `
        <div class="load-error" style="text-align:center; padding: 3rem 1rem; color: #ff6b6b;">
            <h2><i class="fas fa-exclamation-triangle"></i> Rendszerhiba</h2>
            <p>Nem sikerült betölteni a játékokat.</p>
            <p style="font-family: monospace; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; margin-top: 10px; color: #fff;">${error.message}</p>
            <p style="font-size: 0.9rem; margin-top: 15px; color: #a8b0c5;">Tipp: Ellenőrizd a games.json fájlt, valószínűleg hiányzik egy idézőjel vagy egy zárójel!</p>
        </div>`;
    }
  }

  // ─── ADATFELDOLGOZÁS ÉS SZŰRŐK ──────────────────────────────────────────────

  function preprocessData(data) {
    return {
      categories: [...new Set(data.flatMap((game) => Array.isArray(game.category) ? game.category : []))].sort(),
      developers: [
        ...new Set(
          data
            .flatMap((game) =>
              Array.isArray(game.developer) ? game.developer : [game.developer]
            )
            .filter(Boolean)
        ),
      ].sort(),
    };
  }

  function preloadImages() {
    gamesData.forEach((game) => {
      const img = new Image();
      img.src = getCoverUrl(game);
    });
  }

  function getCoverUrl(game) {
    if (game.cover) return game.cover;
    if (game.steamId) {
      return `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg`;
    }
    if (game.stores && game.stores.steam) {
      return `https://cdn.akamai.steamstatic.com/steam/apps/${game.stores.steam}/header.jpg`;
    }
    return CONFIG.fallbackImage;
  }

  function generateFilters({ categories, developers }) {
    categorySelect.innerHTML = `
      <option value="all">Összes kategória</option>
      ${categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join("")}
    `;
    developerSelect.innerHTML = `
      <option value="all">Összes fejlesztő</option>
      ${developers.map((dev) => `<option value="${escapeHtml(dev)}">${escapeHtml(dev)}</option>`).join("")}
    `;
    statusSelect.innerHTML = `
      <option value="all">Összes állapot</option>
      <option value="inprogress">Jelenleg futó végigjátszások</option>
      <option value="planned">Tervezett játékok</option>
      <option value="completed">Befejezett végigjátszások</option>
      <option value="noncompletable">Nem befejezhető</option>
    `;
  }

  function updateFilters() {
    const term = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const developer = developerSelect.value;
    const status = statusSelect.value;

    let filtered = gamesData;

    if (category !== "all") {
      filtered = filtered.filter((game) => Array.isArray(game.category) && game.category.includes(category));
    }
    if (developer !== "all") {
      filtered = filtered.filter((game) =>
        Array.isArray(game.developer) ? game.developer.includes(developer) : game.developer === developer
      );
    }
    if (term) {
      filtered = filtered.filter((game) => (game.title || "").toLowerCase().includes(term));
    }
    if (status !== "all") {
      filtered = filtered.filter((game) => {
        if (status === "noncompletable") return game.nonCompletable === true;
        if (status === "completed") return game.progress === 100;
        if (status === "inprogress") {
          return !game.nonCompletable && typeof game.progress === "number" && game.progress > 0 && game.progress < 100;
        }
        if (status === "planned") {
          return (game.planned === true || game.progress === 0 || game.progress === null || game.progress === undefined) && !game.nonCompletable && game.progress !== 100;
        }
        return true;
      });
    }
    displayGames(filtered);
  }

  // ─── SZEKCIÓK GENERÁLÁSA ────────────────────────────────────────────────────

  function displayGames(games) {
    const sorted = [...games].sort((a, b) => (a.title || "").localeCompare(b.title || "", "hu"));

    const nonCompletable = sorted.filter((game) => game.forceNonCompletable === true);
    const completed = sorted.filter((game) => game.forceCompleted === true && !game.forceNonCompletable);
    const inprogress = sorted.filter((game) => game.forceInProgress === true && !game.forceNonCompletable && !game.forceCompleted);
    const planned = sorted.filter((game) => game.forcePlanned === true && !game.forceNonCompletable && !game.forceCompleted && !game.forceInProgress);

    const remainingGames = sorted.filter(
      (game) => !nonCompletable.includes(game) && !completed.includes(game) && !inprogress.includes(game) && !planned.includes(game)
    );

    remainingGames.forEach((game) => {
      if (game.nonCompletable === true) nonCompletable.push(game);
      else if (game.progress === 100) completed.push(game);
      else if (game.planned === true) planned.push(game);
      else if (typeof game.progress === "number" && game.progress > 0 && game.progress < 100) inprogress.push(game);
      else planned.push(game);
    });

    gamesContainer.innerHTML = `
        ${createSection("Jelenleg futó végigjátszások", inprogress, "inprogress")}
        ${createSection("Befejezett végigjátszások", completed, "completed")}
        ${createSection("Tervezett játékok", planned, "planned")}
        ${createSection("Nem befejezhető játékok", nonCompletable, "noncompletable")}
    `;

    setTimeout(() => {
      document.querySelectorAll(".progress-fill").forEach((bar) => {
        const progress = bar.parentElement.getAttribute("data-progress");
        bar.style.width = progress ? `${progress}%` : "0%";
      });
      initCountdowns();
    }, 100);
  }

  function createSection(title, games, type) {
    if (games.length === 0) return "";
    return `
      <div class="games-section ${type}-section">
          <h2 class="section-title">${title}</h2>
          <div class="games-grid">
              ${games.map((game) => createGameCard(game)).join("")}
          </div>
      </div>
    `;
  }

  // ─── KÁRTYA STRUKTÚRA ────────────────────────────────────────────────────────

  function createGameCard(game) {
    const isNew = checkIfNew(game.dateAdded);
    const isPrePurchase = Array.isArray(game.developmentStatus) ? game.developmentStatus.includes("pre-purchase") : game.developmentStatus === "pre-purchase";
    const hasProgress = typeof game.progress === "number";

    let status = "planned";
    if (game.forceNonCompletable || game.nonCompletable) status = "noncompletable";
    else if (game.forceCompleted || game.progress === 100) status = "completed";
    else if (game.forceInProgress || (game.progress > 0 && game.progress < 100)) status = "inprogress";

    let countdownHTML = "";
    if (isPrePurchase && game.releaseDates) {
      const fullRelease = game.releaseDates.find((rd) => rd && rd.type === "full-release");
      if (fullRelease && fullRelease.date) {
        const gameTitleId = (game.title || "game").replace(/[^a-z0-9]/gi, "-").toLowerCase();
        countdownHTML = `
          <div class="countdown-container">
              <div id="countdown-${gameTitleId}" class="countdown-timer" data-release-date="${fullRelease.date}"></div>
          </div>
        `;
      }
    }

    return `
      <div class="game-card" data-status="${status}">
          <div class="game-cover">
              <img src="${getCoverUrl(game)}" alt="${game.title}" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='${CONFIG.fallbackImage}';}">
              ${isNew ? '<div class="new-badge">ÚJ</div>' : ""}
              ${isPrePurchase ? '<div class="pre-purchase-badge">ELŐRENDELHETŐ</div>' : ""}
              <div class="game-actions">${createActionButtons(game)}</div>
          </div>
          <div class="game-info">
              ${countdownHTML}
              <div class="game-header">
                  <h3 class="game-title">${escapeHtml(game.title)}</h3>
                  ${hasProgress ? `<div class="game-progress">${game.progress}%</div>` : ""}
              </div>
              ${createGameDetails(game)}
              
              <div class="bottom-tags-container">
                  <div class="game-detail-row">
                      <div class="category-tags">${Array.isArray(game.category) ? game.category.map((cat) => `<span class="category-tag">${escapeHtml(cat)}</span>`).join("") : ""}</div>
                  </div>
                  ${hasProgress ? `
                      <div class="progress-bar" data-progress="${game.progress}">
                          <div class="progress-fill"></div>
                      </div>
                  ` : ""}
              </div>
          </div>
      </div>
    `;
  }

  // ─── RÉSZLETEK ÉS PLATFORM METADATOK ──────────────────────────────────────────

  function createGameDetails(game) {
    let releaseDatesHtml = "";
    
    if (game.releaseDates && Array.isArray(game.releaseDates)) {
      let validDates = game.releaseDates.filter(rd => rd && rd.date && rd.date.toLowerCase() !== "nincs adat");
      
      if (validDates.length > 0) {
        releaseDatesHtml = `<div class="release-dates-grid">`;
        validDates.forEach((release) => {
          const platformIcons = {
            pc: '<i class="fab fa-windows"></i> PC',
            ps: '<i class="fab fa-playstation"></i> PlayStation',
            xbox: '<i class="fab fa-xbox"></i> Xbox',
            switch: '<i class="fas fa-gamepad"></i> Switch',
            linux: '<i class="fab fa-linux"></i> Linux',
            mac: '<i class="fab fa-apple"></i> Mac',
            mobile: '<i class="fab fa-android"></i> Mobil',
          };

          const typeLabel = {
            "full-release": "Teljes kiadás",
            "early-access": "Early Access",
            remastered: "Remastered",
            "server-closed": "Szerverek leállítva",
            "in-development": "Fejlesztés alatt",
          }[release.type] || release.type;

          let platClass = (release.platform || "").toLowerCase();

          releaseDatesHtml += `
            <div class="release-date platform-${platClass}">
              ${platformIcons[platClass] || escapeHtml(release.platform)} – ${typeLabel}: ${formatDate(release.date)}
            </div>
          `;
        });
        releaseDatesHtml += `</div>`;
      }
    } else if (game.releaseDate) {
      releaseDatesHtml = `<div class="release-date">Megjelenés: ${formatDate(game.releaseDate)}</div>`;
    }

    let developmentStatusHtml = "";
    if (game.developmentStatus) {
      const statusList = (Array.isArray(game.developmentStatus) ? game.developmentStatus : [game.developmentStatus])
                          .filter(s => s !== "pre-purchase");
      if (statusList.length > 0) {
        developmentStatusHtml = `
          <div class="game-detail-row">
              <div class="development-status-container">
                  ${statusList.map((status) => `
                      <div class="development-status ${status}">
                          <i class="fas ${getStatusIcon(status)}"></i> ${getStatusText(status)}
                      </div>
                  `).join("")}
              </div>
          </div>
        `;
      }
    }
    
    let commentHtml = "";
    const commentSource = game.comment || (Array.isArray(game.comments) ? game.comments.join("; ") : game.comments);
    if (commentSource) {
      commentHtml = `
        <div class="game-comment">
          <div class="comment-header">
            <i class="fas fa-sticky-note"></i> <span class="comment-label">Megjegyzés</span>
          </div>
          <p class="comment-text">${escapeHtml(commentSource)}</p>
        </div>
      `;
    }

    return `
      <div class="game-details">
          <div class="meta-inline-row">
              <div class="platform-tags">${createPlatformTag(game)}</div>
              ${game.developer ? `<span class="developer-tag"><i class="fas fa-code"></i> ${escapeHtml(Array.isArray(game.developer) ? game.developer[0] : game.developer)}</span>` : ""}
              ${game.multiplayer && game.multiplayer.length > 0 ? `
                  <span class="multiplayer-tag ${escapeHtml(game.multiplayer[0])}">
                      <i class="fas ${game.multiplayer[0] === "local" ? "fa-users" : game.multiplayer[0] === "singleplayer" ? "fa-user" : "fa-globe"}"></i>
                      ${game.multiplayer[0] === "local" ? "Helyi" : game.multiplayer[0] === "singleplayer" ? "Egyjátékos" : "Online"}
                  </span>
              ` : ""}
          </div>

          ${developmentStatusHtml}
          ${releaseDatesHtml}
          
          ${game.progress === 100 && game.finishDate ? `<div class="finished-date"><i class="fas fa-trophy"></i> Végigjátszva: ${formatDate(game.finishDate)}</div>` : ""}
          ${game.playTime ? `<div class="playtime"><i class="fas fa-clock"></i> Játékidő: ${escapeHtml(game.playTime)}</div>` : ""}
          ${commentHtml}
      </div>
    `;
  }

  function createPlatformTag(game) {
    let platformTags = "";
    const platformsSet = new Set();
    if (game.platforms && Array.isArray(game.platforms)) {
      game.platforms.forEach((platform) => {
        if (!platform) return;
        const pLower = platform.toString().toLowerCase();
        if (pLower.includes("pc") || pLower.includes("windows")) platformsSet.add("pc");
        if (pLower.includes("playstation") || pLower.includes("ps")) platformsSet.add("ps");
        if (pLower.includes("xbox")) platformsSet.add("xbox");
        if (pLower.includes("switch") || pLower.includes("nintendo")) platformsSet.add("switch");
        if (pLower.includes("linux")) platformsSet.add("linux");
        if (pLower.includes("mac") || pLower.includes("apple")) platformsSet.add("mac");
      });
    }

    const icons = {
      pc: '<span class="platform-tag" title="PC"><i class="fab fa-windows"></i></span>',
      ps: '<span class="platform-tag" title="PlayStation"><i class="fab fa-playstation"></i></span>',
      xbox: '<span class="platform-tag" title="Xbox"><i class="fab fa-xbox"></i></span>',
      switch: '<span class="platform-tag" title="Nintendo Switch"><i class="fas fa-gamepad"></i></span>',
      linux: '<span class="platform-tag" title="Linux"><i class="fab fa-linux"></i></span>',
      mac: '<span class="platform-tag" title="Mac"><i class="fab fa-apple"></i></span>',
    };

    platformsSet.forEach((p) => { platformTags += icons[p] || ""; });
    if (game.hasDLC) platformTags += `<span class="dlc-tag"><i class="fas fa-puzzle-piece"></i> DLC</span>`;
    return platformTags;
  }

  // ─── UTILITY FUNKCIÓK ──────────────────────────────────────────────────────

  function getStatusIcon(status) {
    return { "in-development": "fa-tools", "early-access": "fa-exclamation-triangle", "server-closed": "fa-server", remastered: "fa-redo-alt", "full-release": "fa-check-circle" }[status] || "fa-info-circle";
  }

  function getStatusText(status) {
    return { "in-development": "Fejlesztés alatt", "early-access": "Early Access", "server-closed": "Szerverek bezárva", remastered: "Remastered", "full-release": "Teljes kiadás" }[status] || status;
  }

  function checkIfNew(date) {
    if (!date) return false;
    return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24)) < 7;
  }

  function formatDate(dateString) {
    if (!dateString || dateString.toLowerCase() === "nincs adat") return "Nincs adat";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString; // Ha valamiért nem dátum
    return d.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function initCountdowns() {
    document.querySelectorAll(".countdown-timer").forEach((timer) => {
      const releaseDateStr = timer.dataset.releaseDate;
      if (!releaseDateStr) return;
      const releaseDate = new Date(releaseDateStr);
      if (isNaN(releaseDate)) return;

      if (timer.dataset.intervalId) clearInterval(parseInt(timer.dataset.intervalId));

      const updateCountdown = () => {
        const diff = releaseDate - new Date();
        if (diff <= 0) {
          timer.textContent = "MEGJELENT!";
          timer.classList.add("released");
          clearInterval(parseInt(timer.dataset.intervalId));
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        timer.textContent = `${days} nap ${hours}ó ${minutes}p ${seconds}s`;
      };

      updateCountdown();
      timer.dataset.intervalId = setInterval(updateCountdown, 1000);
    });
  }

  function createActionButtons(game) {
    const playstationUrl = game.playstationStoreId
      ? game.playstationStoreType === "product"
        ? `https://store.playstation.com/en-us/product/${game.playstationStoreId}`
        : `https://store.playstation.com/en-us/concept/${game.playstationStoreId}`
      : game.stores && game.stores.playstation && game.stores.playstation.id
        ? game.stores.playstation.type === "product"
          ? `https://store.playstation.com/en-us/product/${game.stores.playstation.id}`
          : `https://store.playstation.com/en-us/concept/${game.stores.playstation.id}`
        : null;

    const steamId = game.steamId || (game.stores && game.stores.steam);
    const xboxId = game.xboxStoreId || (game.stores && game.stores.xbox);
    const googleId = game.googlePlayStoreId || (game.stores && game.stores.googlePlay);
    const epicId = game.epicGamesId || (game.stores && game.stores.epicGames);
    const gogId = game.gogId || (game.stores && game.stores.gog);
    const nintendoId = game.nintendoStoreId || (game.stores && game.stores.nintendo);

    return `
      ${steamId ? `<button class="action-btn steam-btn" onclick="window.open('https://store.steampowered.com/app/${steamId}', '_blank')" title="Steam"><i class="fab fa-steam"></i></button>` : ""}
      ${playstationUrl ? `<button class="action-btn ps-btn" onclick="window.open('${playstationUrl}', '_blank')" title="PlayStation Store"><i class="fab fa-playstation"></i></button>` : ""}
      ${xboxId ? `<button class="action-btn xbox-btn" onclick="window.open('https://www.xbox.com/en-us/games/store/${xboxId}', '_blank')" title="Xbox Store"><i class="fab fa-xbox"></i></button>` : ""}
      ${googleId ? `<button class="action-btn google-btn" onclick="window.open('https://play.google.com/store/apps/details?id=${googleId}', '_blank')" title="Google PlayStore"><i class="fab fa-google-play"></i></button>` : ""}
      ${epicId ? `<button class="action-btn epic-btn" onclick="window.open('https://store.epicgames.com/en-US/p/${epicId}', '_blank')" title="Epic Games">${getEpicSvg()}</button>` : ""}
      ${gogId ? `<button class="action-btn gog-btn" onclick="window.open('https://www.gog.com/game/${gogId}', '_blank')" title="GOG.com"><i class="fas fa-shopping-basket"></i></button>` : ""}
      ${nintendoId ? `<button class="action-btn nintendo-btn" onclick="window.open('https://www.nintendo.com/games/detail/${nintendoId}', '_blank')" title="Nintendo Store"><i class="fas fa-gamepad"></i></button>` : ""}
      ${game.videoId ? `<button class="action-btn youtube-btn" onclick="window.showTrailer('${game.videoId}', '${getCoverUrl(game)}')" title="Előzetes megtekintése"><i class="fab fa-youtube"></i></button>` : ""}
    `;
  }

  function getEpicSvg() {
    return `<svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" style="vertical-align:middle;"><path d="M8 8h16v16H8z"/></svg>`;
  }

  // ─── TRAILER MODAL UTASÍTÁSOK ───────────────────────────────────────────────

  window.showTrailer = function(videoId, coverUrl) {
    let coverBackground = trailerModal.querySelector(".modal-cover-background") || document.createElement("div");
    if (!coverBackground.parentElement) {
      coverBackground.className = "modal-cover-background";
      trailerModal.insertBefore(coverBackground, trailerModal.firstChild);
    }
    coverBackground.style.backgroundImage = `url(${coverUrl || CONFIG.fallbackImage})`;
    trailerModal.classList.add("with-cover");
    trailerFrame.src = `${CONFIG.youtubeEmbedUrl}${videoId}?autoplay=1`;
    trailerModal.style.display = "block";
    document.body.style.overflow = "hidden";
    if (modalClose) modalClose.focus();
  };

  function closeModal() {
    trailerModal.style.display = "none";
    trailerFrame.src = "";
    document.body.style.overflow = "";
    trailerModal.classList.remove("with-cover");
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => { if (e.target === trailerModal) closeModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  searchInput.addEventListener("input", updateFilters);
  categorySelect.addEventListener("change", updateFilters);
  developerSelect.addEventListener("change", updateFilters);
  statusSelect.addEventListener("change", updateFilters);

  loadGames();
}

// ─── GLOBÁLIS FOOTER ÉS BACK-TO-TOP UTASÍTÁSOK ───────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const backToTop = document.querySelector("button#backToTop, button.back-to-top");
  if (!backToTop) return;

  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("visible", window.scrollY > 500);
  });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
});
