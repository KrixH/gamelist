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
  let countdownIntervals = []; 

  // ───────────────────────── SKELETON LOADING ──────────────────────────────
  function showSkeletonLoading() {
    const skeletonHTML = `
      <div class="games-section">
        <h2 class="section-title" style="color: var(--color-text-medium);">Betöltés...</h2>
        <div class="skeleton-grid">
          ${Array(6).fill(`
            <div class="skeleton-card">
              <div class="skeleton-cover"></div>
              <div class="skeleton-title"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    gamesContainer.innerHTML = skeletonHTML;
  }

  // ───────────────────────── ADATBETÖLTÉS ──────────────────────────────────
  async function loadGames() {
    showSkeletonLoading(); 

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

      gamesData.sort((a, b) => {
        return (a.title || "").localeCompare(b.title || "", "hu", { 
          numeric: true, 
          sensitivity: "base" 
        });
      });

      preprocessedData = preprocessData(gamesData);
      preloadImages();
      generateFilters(preprocessedData);
      displayGames(gamesData);
      
    } catch (error) {
      console.error("Betöltési hiba:", error);
      gamesContainer.innerHTML = `
        <div class="load-error" style="text-align:center; padding: 3rem 1rem; color: #ff6b6b;">
            <h2><i class="fas fa-exclamation-triangle"></i> Rendszerhiba</h2>
            <p>Nem sikerült betölteni a játékokat.</p>
            <p style="font-family: monospace; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; margin-top: 10px; color: #fff;">${escapeHtml(error.message)}</p>
            <p style="font-size: 0.9rem; margin-top: 15px; color: #a8b0c5;">Tipp: Ellenőrizd a games.json fájlt, valószínűleg hiányzik egy idézőjel vagy egy zárójel!</p>
        </div>`;
    }
  }

  // ─── ADATFELDOLGOZÁS ÉS SZŰRŐK ──────────────────────────────────────────

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
    const gamesToPreload = gamesData.slice(0, 20);
    gamesToPreload.forEach((game) => {
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

  // ────────── FILTER ──────────────────────────────────────────────────────────
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
    filtered.sort((a, b) => {
      return (a.title || "").localeCompare(b.title || "", "hu", { 
        numeric: true, 
        sensitivity: "base" 
      });
    });

    displayGames(filtered);
  }

  // ─── SZEKCIÓK GENERÁLÁSA ──────────────────────────────────────────────────

  function displayGames(games) {
    countdownIntervals.forEach(clearInterval);
    countdownIntervals = [];

    const sorted = [...games];

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

    const naturalSort = (a, b) => {
      return (a.title || "").localeCompare(b.title || "", "hu", { 
        numeric: true, 
        sensitivity: "base" 
      });
    };

    inprogress.sort(naturalSort);
    completed.sort(naturalSort);
    planned.sort(naturalSort);
    nonCompletable.sort(naturalSort);

    gamesContainer.innerHTML = `
        ${createSection("Jelenleg futó végigjátszások", inprogress, "inprogress")}
        ${createSection("Befejezett végigjátszások", completed, "completed")}
        ${createSection("Tervezett játékok", planned, "planned")}
        ${createSection("Nem befejezhető játékok", nonCompletable, "noncompletable")}
    `;

    document.querySelectorAll(".game-card").forEach((cardElement) => {
      const detailsBtn = cardElement.querySelector(".btn-details");
      if (detailsBtn) {
        detailsBtn.replaceWith(detailsBtn.cloneNode(true));
        const newBtn = cardElement.querySelector(".btn-details");
        newBtn.addEventListener("click", () => toggleDetails(cardElement));
      }
    });

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

  // ─── KÁRTYA STRUKTÚRA ────────────────────────────────────────────────────

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
              <img src="${getCoverUrl(game)}" alt="${escapeHtml(game.title)}" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='${CONFIG.fallbackImage}';}" loading="lazy">
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

  // ─── RÉSZLETEK ÉS PLATFORM METADATOK ──────────────────────────────────

  function createGameDetails(game) {
    let releaseDatesHtml = "";
    
    if (game.releaseDates && Array.isArray(game.releaseDates)) {
      let validDates = game.releaseDates.filter(rd => {
        if (!rd) return false;
        if (rd.type === "announced") return true; 
        return rd.date && rd.date.toLowerCase() !== "nincs adat"; 
      });
      
      const platformOrder = {
        "pc": 1,
        "linux": 2,
        "mac": 3,
        "xbox": 4,
        "ps": 5,
        "switch": 6,
        "mobile": 7
      };

      validDates.sort((a, b) => {
        let orderA = platformOrder[(a.platform || "").toLowerCase()] || 99;
        let orderB = platformOrder[(b.platform || "").toLowerCase()] || 99;
        return orderA - orderB;
      });

      if (validDates.length > 0) {
        releaseDatesHtml = `<div class="release-dates-grid">`;
        validDates.forEach((release) => {
          const platformIcons = {
            pc: '<i class="fab fa-windows"></i> PC',
            ps: '<i class="fab fa-playstation"></i> PlayStation',
            xbox: '<i class="fab fa-xbox"></i> Xbox',
            switch: '<i class="fas fa-gamepad"></i> Nintendo Switch 2',
            linux: '<i class="fab fa-linux"></i> Linux',
            mac: '<i class="fab fa-apple"></i> Mac',
            mobile: '<i class="fab fa-android"></i> Mobil',
          };

          const typeLabel = {
            "full-release": "Teljes kiadás",
            "early-access": "Early Access",
            "remastered": "Remastered",
            "server-closed": "Szerverek leállítva",
            "in-development": "Fejlesztés alatt",
            "announced": "Bejelentve"
          }[release.type] || release.type;

          let platClass = (release.platform || "").toLowerCase();
          const platformName = platformIcons[platClass] || escapeHtml(release.platform);

          const hasDate = release.date && typeof release.date === "string" && release.date.trim() !== "";

          let displayText = "";

          if (release.type === "announced") {
            displayText = hasDate 
              ? `${platformName} – ${typeLabel} – ${formatDate(release.date)}`
              : `${platformName} – ${typeLabel}`;
          } else {
            displayText = hasDate
              ? `${platformName} – ${typeLabel}: ${formatDate(release.date)}`
              : `${platformName} – ${typeLabel}`;
          }

          releaseDatesHtml += `
            <div class="release-date platform-${platClass}">
              ${displayText}
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

  // ─── PLATFORM TAG  ──────────────────────

  function createPlatformTag(game) {
    let platformTags = "";
    const platformsSet = new Set();
    
    if (game.platforms && Array.isArray(game.platforms) && game.platforms.length > 0) {
      game.platforms.forEach((platform) => {
        if (!platform) return;
        const pLower = platform.toString().toLowerCase();
        if (pLower.includes("pc") || pLower.includes("windows")) platformsSet.add("pc");
        if (pLower.includes("playstation") || pLower.includes("ps")) platformsSet.add("ps");
        if (pLower.includes("xbox")) platformsSet.add("xbox");
        if (pLower.includes("switch") || pLower.includes("nintendo")) platformsSet.add("switch");
        if (pLower.includes("linux")) platformsSet.add("linux");
        if (pLower.includes("mac") || pLower.includes("apple")) platformsSet.add("mac");
        if (pLower.includes("mobile") || pLower.includes("android") || pLower.includes("ios")) platformsSet.add("mobile");
      });
    }

    if (platformsSet.size === 0) return "";

    const icons = {
      pc: '<span class="platform-tag" title="PC"><i class="fab fa-windows"></i></span>',
      ps: '<span class="platform-tag" title="PlayStation"><i class="fab fa-playstation"></i></span>',
      xbox: '<span class="platform-tag" title="Xbox"><i class="fab fa-xbox"></i></span>',
      switch: '<span class="platform-tag" title="Nintendo Switch 2"><i class="fas fa-gamepad"></i></span>',
      linux: '<span class="platform-tag" title="Linux"><i class="fab fa-linux"></i></span>',
      mac: '<span class="platform-tag" title="Mac"><i class="fab fa-apple"></i></span>',
      mobile: '<span class="platform-tag" title="Mobil"><i class="fab fa-android"></i></span>',
    };

    const platformOrder = {
      "pc": 1,
      "linux": 2,
      "mac": 3,
      "xbox": 4,
      "ps": 5,
      "switch": 6,
      "mobile": 7
    };

    const sortedPlatforms = Array.from(platformsSet).sort((a, b) => {
      return (platformOrder[a] || 99) - (platformOrder[b] || 99);
    });

    sortedPlatforms.forEach((p) => {
      platformTags += icons[p] || "";
    });

    if (game.hasDLC) platformTags += `<span class="dlc-tag" title="DLC"><i class="fas fa-puzzle-piece"></i></span>`;
    return platformTags;
  }

  // ─── UTILITY FUNKCIÓK ──────────────────────────────────────────────────

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

  // ─── FORMATDATE  ──────────────────────────────

  function formatDate(dateString) {
    if (!dateString || dateString === null || dateString === undefined) return "Nincs adat";
    if (dateString.toLowerCase() === "nincs adat") return "Nincs adat";
    
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // Ha valamiért nem dátum
    return d.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ─── COUNTDOWN  ──────────────────────

  function initCountdowns() {
    countdownIntervals.forEach(clearInterval);
    countdownIntervals = [];

    document.querySelectorAll(".countdown-timer").forEach((timer) => {
      const releaseDateStr = timer.dataset.releaseDate;
      if (!releaseDateStr) return;
      const releaseDate = new Date(releaseDateStr);
      if (isNaN(releaseDate.getTime())) return;

      const updateCountdown = () => {
        const diff = releaseDate - new Date();
        if (diff <= 0) {
          timer.textContent = "MEGJELENT!";
          timer.classList.add("released");
          const intervalId = parseInt(timer.dataset.intervalId);
          if (intervalId) {
            clearInterval(intervalId);
            const index = countdownIntervals.indexOf(intervalId);
            if (index > -1) countdownIntervals.splice(index, 1);
          }
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        timer.textContent = `${days} nap ${hours}ó ${minutes}p ${seconds}s`;
      };

      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000);
      timer.dataset.intervalId = intervalId;
      countdownIntervals.push(intervalId);
    });
  }

  // ─── ACTION BUTTONS  ─────────────────────

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

  // ─── EPIC SVG  ─────────────────────────────────────

  function getEpicSvg() {
    return `<svg width="18" height="18" viewBox="-2 0 28 32" fill="currentColor" style="vertical-align:middle; display:inline-block; margin-right:5px;"><path d="M4.719 0c-1.833 0-2.505 0.677-2.505 2.505v22.083c0 0.209 0.011 0.401 0.027 0.579 0.047 0.401 0.047 0.792 0.421 1.229 0.036 0.052 0.412 0.328 0.412 0.328 0.203 0.099 0.343 0.172 0.572 0.265l11.115 4.656c0.573 0.261 0.819 0.371 1.235 0.355h0.005c0.421 0.016 0.667-0.093 1.24-0.355l11.109-4.656c0.235-0.093 0.369-0.167 0.577-0.265 0 0 0.376-0.287 0.412-0.328 0.375-0.437 0.375-0.828 0.421-1.229 0.016-0.177 0.027-0.369 0.027-0.573v-22.088c0-1.828-0.677-2.505-2.505-2.505zM22.527 4.145h0.905c1.511 0 2.251 0.735 2.251 2.267v2.505h-1.833v-2.407c0-0.489-0.224-0.713-0.699-0.713h-0.312c-0.489 0-0.713 0.224-0.713 0.713v7.749c0 0.489 0.224 0.713 0.713 0.713h0.349c0.468 0 0.692-0.224 0.692-0.713v-2.771h1.833v2.86c0 1.525-0.749 2.276-2.265 2.276h-0.921c-1.521 0-2.267-0.756-2.267-2.276v-7.923c0-1.525 0.745-2.281 2.267-2.281zM6.276 4.251h4.151v1.703h-2.287v3.468h2.204v1.699h-2.204v3.697h2.319v1.704h-4.183zM11.364 4.251h2.928c1.515 0 2.265 0.755 2.265 2.28v3.261c0 1.525-0.751 2.276-2.265 2.276h-1.057v4.453h-1.871zM17.401 4.251h1.864v12.271h-1.864zM13.229 5.901v4.52h0.771c0.469 0 0.693-0.228 0.693-0.719v-3.083c0-0.489-0.224-0.719-0.693-0.719zM8.088 19.437h0.276l0.063 0.011h0.1l0.052 0.016h0.052l0.047 0.015 0.052 0.011 0.041 0.011 0.093 0.021 0.053 0.015 0.036 0.011 0.041 0.016 0.052 0.016 0.036 0.015 0.053 0.021 0.047 0.021 0.041 0.025 0.047 0.021 0.036 0.025 0.053 0.027 0.041 0.025 0.041 0.021 0.041 0.031 0.043 0.027 0.036 0.031 0.125 0.095-0.032 0.041-0.036 0.036-0.032 0.037-0.036 0.041-0.025 0.036-0.032 0.037-0.036 0.036-0.032 0.041-0.025 0.036-0.037 0.043-0.031 0.036-0.036 0.041-0.032 0.037-0.025 0.041-0.037 0.036-0.031 0.043-0.036 0.036-0.032 0.036-0.036-0.025-0.041-0.037-0.043-0.025-0.077-0.052-0.047-0.027-0.043-0.025-0.047-0.027-0.036-0.021-0.041-0.020-0.084-0.032-0.052-0.009-0.041-0.011-0.047-0.011-0.053-0.011-0.052-0.005h-0.052l-0.061-0.011h-0.1l-0.052 0.005h-0.052l-0.052 0.016-0.041 0.011-0.047 0.016-0.047 0.009-0.043 0.021-0.052 0.021-0.072 0.052-0.043 0.025-0.036 0.032-0.036 0.025-0.037 0.032-0.025 0.036-0.043 0.036-0.052 0.073-0.025 0.041-0.021 0.047-0.025 0.037-0.027 0.047-0.016 0.047-0.020 0.041-0.016 0.052-0.005 0.052-0.015 0.048-0.011 0.052v0.052l-0.005 0.052v0.12l0.005 0.052v0.041l0.005 0.052 0.009 0.047 0.016 0.041 0.005 0.053 0.016 0.041 0.015 0.036 0.021 0.052 0.027 0.052 0.020 0.037 0.052 0.083 0.032 0.041 0.025 0.037 0.043 0.031 0.025 0.036 0.036 0.032 0.084 0.063 0.036 0.020 0.041 0.027 0.048 0.021 0.052 0.020 0.036 0.021 0.104 0.031 0.047 0.005 0.052 0.016 0.052 0.005h0.224l0.063-0.005h0.047l0.053-0.021 0.052-0.005 0.052-0.015 0.041-0.011 0.047-0.021 0.041-0.020 0.047-0.021 0.032-0.021 0.041-0.025v-0.464h-0.735v-0.744h1.661v1.667l-0.036 0.025-0.036 0.031-0.037 0.027-0.041 0.031-0.041 0.021-0.036 0.032-0.084 0.052-0.052 0.025-0.083 0.052-0.053 0.021-0.041 0.020-0.047 0.021-0.104 0.041-0.041 0.021-0.095 0.031-0.047 0.011-0.047 0.016-0.052 0.016-0.041 0.009-0.156 0.032-0.048 0.005-0.104 0.011-0.057 0.005-0.052 0.004-0.057 0.005h-0.26l-0.052-0.009h-0.052l-0.052-0.011h-0.047l-0.052-0.016-0.152-0.031-0.041-0.016-0.047-0.005-0.052-0.021-0.095-0.031-0.093-0.041-0.052-0.021-0.036-0.021-0.052-0.020-0.037-0.032-0.052-0.020-0.031-0.027-0.041-0.025-0.084-0.063-0.041-0.027-0.032-0.031-0.041-0.032-0.068-0.067-0.036-0.032-0.031-0.036-0.037-0.037-0.025-0.041-0.032-0.031-0.025-0.043-0.032-0.041-0.025-0.036-0.027-0.041-0.025-0.048-0.021-0.041-0.021-0.047-0.020-0.041-0.041-0.095-0.016-0.036-0.021-0.047-0.011-0.047-0.009-0.041-0.011-0.052-0.016-0.048-0.011-0.052-0.005-0.041-0.009-0.052-0.011-0.093-0.011-0.104v-0.276l0.011-0.053v-0.052l0.016-0.052v-0.052l0.015-0.047 0.016-0.052 0.021-0.093 0.015-0.052 0.016-0.047 0.063-0.141 0.020-0.041 0.021-0.047 0.027-0.048 0.020-0.041 0.027-0.036 0.052-0.084 0.031-0.041 0.032-0.036 0.025-0.041 0.068-0.068 0.031-0.037 0.037-0.036 0.031-0.036 0.043-0.032 0.072-0.063 0.041-0.031 0.043-0.027 0.036-0.031 0.041-0.027 0.043-0.020 0.047-0.027 0.052-0.025 0.036-0.027 0.052-0.020 0.047-0.021 0.047-0.025 0.043-0.011 0.052-0.016 0.041-0.021 0.047-0.009 0.047-0.016 0.052-0.011 0.043-0.016 0.052-0.011h0.052l0.047-0.015h0.052l0.052-0.011h0.047zM24.073 19.448h0.276l0.063 0.011h0.099l0.052 0.015h0.057l0.052 0.016 0.093 0.021 0.052 0.011 0.047 0.009 0.053 0.016 0.047 0.016 0.041 0.011 0.047 0.015 0.052 0.016 0.041 0.021 0.052 0.020 0.048 0.021 0.047 0.027 0.036 0.020 0.047 0.027 0.047 0.020 0.043 0.027 0.047 0.031 0.036 0.027 0.084 0.063 0.041 0.025-0.032 0.041-0.025 0.043-0.031 0.036-0.032 0.041-0.025 0.047-0.027 0.043-0.031 0.036-0.032 0.041-0.025 0.043-0.032 0.041-0.025 0.036-0.032 0.041-0.025 0.048-0.032 0.041-0.031 0.036-0.032 0.041-0.025 0.043-0.041-0.032-0.048-0.025-0.036-0.027-0.041-0.025-0.047-0.021-0.043-0.027-0.047-0.020-0.036-0.021-0.052-0.020-0.037-0.021-0.041-0.016-0.093-0.031-0.104-0.032-0.156-0.031-0.052-0.005-0.095-0.011h-0.109l-0.057 0.011-0.052 0.011-0.047 0.011-0.041 0.020-0.037 0.021-0.041 0.036-0.031 0.047-0.021 0.048v0.124l0.027 0.057 0.020 0.032 0.032 0.031 0.052 0.027 0.041 0.025 0.047 0.021 0.052 0.020 0.068 0.016 0.036 0.016 0.043 0.011 0.052 0.011 0.041 0.015 0.047 0.011 0.057 0.016 0.052 0.016 0.057 0.015 0.057 0.011 0.047 0.016 0.057 0.015 0.052 0.011 0.047 0.011 0.157 0.047 0.041 0.016 0.052 0.016 0.047 0.020 0.052 0.027 0.104 0.041 0.047 0.027 0.084 0.052 0.077 0.057 0.048 0.031 0.036 0.036 0.036 0.043 0.037 0.036 0.025 0.036 0.037 0.052 0.025 0.037 0.021 0.052 0.020 0.031 0.016 0.052 0.016 0.043 0.011 0.047 0.020 0.104 0.005 0.052 0.005 0.047v0.125l-0.005 0.057-0.011 0.104-0.011 0.052-0.015 0.047-0.011 0.052-0.016 0.052-0.015 0.047-0.021 0.037-0.021 0.047-0.025 0.041-0.032 0.037-0.052 0.083-0.063 0.073-0.036 0.025-0.041 0.037-0.032 0.031-0.041 0.031-0.041 0.021-0.041 0.032-0.048 0.025-0.093 0.047-0.052 0.021-0.047 0.020-0.052 0.016-0.047 0.016-0.043 0.011-0.104 0.020-0.036 0.011-0.052 0.011h-0.052l-0.047 0.011h-0.052l-0.052 0.011h-0.371l-0.156-0.016-0.052-0.011-0.047-0.005-0.104-0.020-0.057-0.011-0.047-0.011-0.052-0.016-0.053-0.011-0.047-0.015-0.052-0.016-0.052-0.021-0.041-0.015-0.052-0.016-0.052-0.021-0.037-0.020-0.052-0.016-0.041-0.027-0.052-0.020-0.041-0.027-0.037-0.025-0.052-0.027-0.036-0.020-0.041-0.032-0.041-0.025-0.043-0.032-0.036-0.031-0.041-0.032-0.037-0.025-0.041-0.037 0.032-0.041 0.036-0.036 0.031-0.037 0.037-0.041 0.025-0.036 0.032-0.041 0.036-0.037 0.031-0.036 0.037-0.041 0.025-0.037 0.037-0.036 0.031-0.041 0.032-0.037 0.036-0.041 0.025-0.036 0.037-0.037 0.036-0.041 0.036 0.032 0.048 0.031 0.036 0.031 0.052 0.027 0.036 0.027 0.047 0.031 0.043 0.027 0.047 0.020 0.036 0.027 0.047 0.015 0.052 0.021 0.043 0.021 0.047 0.015 0.041 0.021 0.052 0.016 0.047 0.015 0.052 0.016 0.052 0.005 0.048 0.016 0.052 0.005h0.057l0.047 0.015h0.281l0.047-0.009 0.052-0.011 0.036-0.005 0.043-0.016 0.036-0.020 0.047-0.032 0.027-0.036 0.020-0.041 0.016-0.048v-0.12l-0.021-0.047-0.025-0.041-0.032-0.031-0.047-0.032-0.036-0.015-0.047-0.021-0.052-0.021-0.057-0.025-0.037-0.011-0.041-0.011-0.052-0.016-0.036-0.009-0.052-0.016-0.052-0.005-0.053-0.021-0.052-0.005-0.057-0.015-0.047-0.011-0.052-0.016-0.052-0.011-0.052-0.015-0.047-0.016-0.052-0.011-0.041-0.016-0.095-0.031-0.052-0.021-0.052-0.015-0.104-0.043-0.047-0.025-0.052-0.027-0.036-0.025-0.048-0.027-0.036-0.025-0.047-0.027-0.068-0.068-0.036-0.031-0.063-0.073-0.027-0.036-0.020-0.036-0.032-0.048-0.015-0.036-0.048-0.125-0.009-0.052-0.011-0.047v-0.047l-0.011-0.052v-0.213l0.011-0.104 0.011-0.043 0.009-0.047 0.016-0.041 0.011-0.052 0.021-0.036 0.020-0.053 0.021-0.041 0.020-0.052 0.027-0.036 0.036-0.041 0.027-0.043 0.041-0.036 0.031-0.036 0.032-0.043 0.047-0.036 0.032-0.027 0.041-0.031 0.083-0.052 0.047-0.027 0.095-0.047 0.041-0.015 0.047-0.016 0.052-0.021 0.052-0.015 0.037-0.011 0.047-0.011 0.041-0.011 0.047-0.011 0.052-0.011 0.104-0.009 0.048-0.005zM11.755 19.484h0.943l0.043 0.095 0.020 0.041 0.016 0.052 0.021 0.047 0.015 0.041 0.027 0.047 0.031 0.095 0.027 0.047 0.041 0.093 0.011 0.041 0.083 0.188 0.016 0.047 0.021 0.043 0.025 0.047 0.011 0.047 0.027 0.052 0.009 0.047 0.048 0.093 0.020 0.037 0.021 0.052 0.016 0.052 0.015 0.036 0.027 0.052 0.016 0.043 0.020 0.052 0.016 0.036 0.021 0.052 0.047 0.093 0.015 0.047 0.011 0.048 0.021 0.047 0.025 0.041 0.021 0.052 0.021 0.047 0.015 0.041 0.043 0.095 0.015 0.047 0.021 0.047 0.016 0.047 0.020 0.041 0.027 0.048 0.020 0.047 0.021 0.041 0.011 0.052 0.041 0.093 0.021 0.043 0.015 0.047 0.043 0.093 0.025 0.052 0.011 0.041 0.027 0.053 0.009 0.036 0.021 0.052 0.027 0.052 0.020 0.036 0.016 0.052 0.021 0.043 0.015 0.052 0.027 0.036 0.031 0.104 0.021 0.037 0.020 0.052 0.027 0.041 0.021 0.052 0.009 0.047 0.016 0.041 0.021 0.047 0.025 0.043h-1.041l-0.025-0.043-0.016-0.047-0.021-0.047-0.020-0.052-0.011-0.041-0.043-0.093-0.015-0.043-0.041-0.093-0.016-0.041-0.021-0.052-0.031-0.095-0.021-0.041h-1.448l-0.020 0.047-0.016 0.043-0.021 0.052-0.020 0.047-0.011 0.041-0.021 0.052-0.020 0.041-0.016 0.047-0.021 0.043-0.020 0.052-0.016 0.036-0.021 0.052-0.015 0.052-0.021 0.037-0.016 0.052h-1.031l0.015-0.048 0.043-0.093 0.015-0.052 0.016-0.041 0.027-0.047 0.020-0.047 0.021-0.043 0.011-0.047 0.020-0.052 0.027-0.041 0.020-0.047 0.032-0.095 0.047-0.093 0.016-0.047 0.020-0.041 0.016-0.048 0.063-0.14 0.021-0.052 0.015-0.041 0.016-0.047 0.027-0.043 0.020-0.052 0.016-0.047 0.016-0.041 0.020-0.052 0.027-0.037 0.016-0.052 0.020-0.041 0.016-0.047 0.021-0.052 0.025-0.041 0.016-0.052 0.020-0.037 0.016-0.052 0.021-0.052 0.020-0.036 0.021-0.052 0.016-0.043 0.020-0.052 0.016-0.036 0.027-0.052 0.020-0.052 0.021-0.041 0.011-0.047 0.020-0.048 0.027-0.047 0.020-0.041 0.011-0.052 0.021-0.047 0.021-0.043 0.041-0.093 0.015-0.041 0.043-0.104 0.020-0.037 0.021-0.052 0.016-0.041 0.015-0.052 0.021-0.047 0.027-0.041 0.020-0.052 0.016-0.037 0.016-0.052 0.020-0.041 0.027-0.047 0.016-0.052 0.015-0.043 0.021-0.052 0.020-0.036 0.027-0.052 0.016-0.052 0.015-0.036 0.021-0.052zM14.683 19.511h1.031l0.032 0.041 0.052 0.084 0.025 0.047 0.027 0.036 0.025 0.047 0.027 0.041 0.025 0.048 0.027 0.041 0.025 0.036 0.027 0.047 0.025 0.043 0.037 0.041 0.015 0.041 0.032 0.047 0.025 0.043 0.032 0.036 0.021 0.047 0.025 0.041 0.032 0.043 0.015 0.041 0.037 0.047 0.077 0.125 0.021 0.041 0.031 0.041 0.027 0.041 0.025 0.048 0.079 0.124 0.025 0.048 0.027 0.041 0.031-0.041 0.021-0.053 0.031-0.036 0.027-0.047 0.025-0.036 0.021-0.052 0.036-0.037 0.027-0.047 0.021-0.036 0.025-0.043 0.032-0.047 0.025-0.036 0.027-0.052 0.025-0.036 0.032-0.048 0.020-0.036 0.027-0.052 0.025-0.031 0.027-0.043 0.031-0.052 0.027-0.036 0.020-0.047 0.032-0.037 0.025-0.052 0.027-0.031 0.031-0.041 0.027-0.052 0.025-0.037 0.027-0.047 0.025-0.036 0.027-0.052 0.031-0.037 0.021-0.047 0.027-0.036h1.047v3.719h-0.98v-2.188l-0.025 0.037-0.032 0.052-0.025 0.031-0.032 0.041-0.020 0.052-0.032 0.037-0.025 0.036-0.032 0.052-0.052 0.073-0.031 0.041-0.027 0.052-0.031 0.037-0.027 0.036-0.020 0.052-0.032 0.036-0.025 0.037-0.032 0.052-0.025 0.036-0.032 0.041-0.025 0.047-0.021 0.037-0.031 0.041-0.027 0.047-0.031 0.036-0.032 0.043-0.020 0.041-0.027 0.047-0.031 0.037-0.032 0.041-0.020 0.052-0.037 0.031-0.020 0.041-0.032 0.053-0.025 0.036h-0.021l-0.031-0.047-0.027-0.043-0.025-0.047-0.027-0.036-0.031-0.047-0.027-0.041-0.031-0.043-0.027-0.041-0.025-0.047-0.027-0.036-0.036-0.048-0.021-0.041-0.031-0.047-0.027-0.036-0.025-0.047-0.032-0.043-0.025-0.052-0.032-0.036-0.025-0.047-0.027-0.043-0.025-0.047-0.032-0.036-0.025-0.047-0.032-0.041-0.020-0.043-0.032-0.041-0.025-0.047-0.032-0.036-0.025-0.048-0.032-0.041-0.020-0.047-0.037-0.036-0.020-0.048-0.032-0.041v2.193h-0.963v-3.683zM19.307 19.511h2.933v0.839h-1.959v0.599h1.76v0.792h-1.76v0.635h1.984v0.844h-2.953v-3.677zM12.213 20.651l-0.016 0.047-0.015 0.043-0.021 0.052-0.021 0.047-0.015 0.047-0.043 0.093-0.020 0.052-0.016 0.043-0.016 0.052-0.020 0.036-0.016 0.052-0.021 0.052-0.020 0.037-0.016 0.052-0.020 0.041-0.016 0.052-0.027 0.047-0.011 0.041-0.020 0.052-0.021 0.048-0.016 0.041-0.020 0.052h0.859l-0.020-0.052-0.016-0.047-0.041-0.095-0.016-0.047-0.021-0.041-0.015-0.052-0.021-0.047-0.016-0.047-0.020-0.043-0.016-0.047-0.021-0.052-0.015-0.041-0.043-0.093-0.009-0.048-0.021-0.047-0.021-0.052-0.015-0.036-0.043-0.104-0.015-0.047zM10.683 27.615h10.681l-5.452 1.797z"/></svg>`;
  }


  window.showTrailer = function(videoId, coverUrl) {
    let coverBackground = trailerModal.querySelector(".modal-cover-background") || document.createElement("div");
    if (!coverBackground.parentElement) {
      coverBackground.className = "modal-cover-background";
      trailerModal.insertBefore(coverBackground, trailerModal.firstChild);
    }
    coverBackground.style.backgroundImage = `url(${coverUrl || CONFIG.fallbackImage})`;
    trailerModal.classList.add("with-cover");
    trailerFrame.src = `${CONFIG.youtubeEmbedUrl}${videoId}?autoplay=1&enablejsapi=1`;
    trailerModal.style.display = "block";
    document.body.style.overflow = "hidden";
    if (modalClose) modalClose.focus();
  };

  function closeModal() {
    trailerFrame.src = "";
    trailerModal.style.display = "none";
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

// ─── GLOBÁLIS FOOTER ÉS BACK-TO-TOP ──────────────────────────────────

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