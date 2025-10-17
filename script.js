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

  async function loadGames() {
    try {
      const response = await fetch("games.json");
      const data = await response.json();
      gamesData = data.games.map((game) => ({
        nonCompletable: false,
        progress: null,
        ...game,
      }));
      preprocessedData = preprocessData(gamesData);
      preloadImages();
      generateFilters(preprocessedData);
      displayGames(gamesData);
    } catch (error) {
      console.error("Hiba:", error);
      gamesContainer.innerHTML = "<p>Nem sikerült betölteni az adatokat.</p>";
    }
  }

  function preprocessData(data) {
    return {
      categories: [...new Set(data.flatMap((game) => game.category))],
      developers: [
        ...new Set(
          data
            .flatMap((game) =>
              Array.isArray(game.developer) ? game.developer : [game.developer]
            )
            .filter(Boolean)
        ),
      ],
    };
  }

  function preloadImages() {
    gamesData.forEach((game) => {
      const img = new Image();
      img.src = getCoverUrl(game);
      img.onerror = () => {
        console.warn(`Failed to load cover for ${game.title}, using fallback`);
        img.src = CONFIG.fallbackImage;
      };
    });
  }

  function getCoverUrl(game) {
    if (game.cover) {
      return game.cover;
    } else if (game.steamId) {
      return `https://cdn.akamai.steamstatic.com/steam/apps/${game.steamId}/header.jpg`;
    } else {
      return CONFIG.fallbackImage;
    }
  }

  function generateFilters({ categories, developers }) {
    categorySelect.innerHTML = `
            <option value="all">Összes kategória</option>
            ${categories
              .map((cat) => `<option value="${cat}">${cat}</option>`)
              .join("")}
        `;

    developerSelect.innerHTML = `
            <option value="all">Összes fejlesztő</option>
            ${developers
              .map((dev) => `<option value="${dev}">${dev}</option>`)
              .join("")}
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
      filtered = filtered.filter((game) => game.category.includes(category));
    }

    if (developer !== "all") {
      filtered = filtered.filter((game) =>
        Array.isArray(game.developer)
          ? game.developer.includes(developer)
          : game.developer === developer
      );
    }

    if (term) {
      filtered = filtered.filter((game) =>
        game.title.toLowerCase().includes(term)
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((game) => {
        if (status === "noncompletable") return game.nonCompletable === true;
        if (status === "completed") return game.progress === 100;
        if (status === "inprogress") {
          return (
            !game.nonCompletable &&
            typeof game.progress === "number" &&
            game.progress > 0 &&
            game.progress < 100
          );
        }
        if (status === "planned") {
          return (
            (game.planned === true ||
              game.progress === 0 ||
              game.progress === null ||
              game.progress === undefined) &&
            !game.nonCompletable &&
            game.progress !== 100
          );
        }
        return true;
      });
    }

    displayGames(filtered);
  }

  function displayGames(games) {
    const sorted = [...games].sort((a, b) =>
      a.title.localeCompare(b.title, "hu")
    );

    // 1. Első körben kezeljük a force flag-eket (legmagasabb prioritás)
    const nonCompletable = sorted.filter(
      (game) => game.forceNonCompletable === true
    );
    const completed = sorted.filter(
      (game) => game.forceCompleted === true && !game.forceNonCompletable
    );
    const inprogress = sorted.filter(
      (game) =>
        game.forceInProgress === true &&
        !game.forceNonCompletable &&
        !game.forceCompleted
    );
    const planned = sorted.filter(
      (game) =>
        game.forcePlanned === true &&
        !game.forceNonCompletable &&
        !game.forceCompleted &&
        !game.forceInProgress
    );

    // 2. Második körben kezeljük a nem force-olt játékokat
    const remainingGames = sorted.filter(
      (game) =>
        !nonCompletable.includes(game) &&
        !completed.includes(game) &&
        !inprogress.includes(game) &&
        !planned.includes(game)
    );

    remainingGames.forEach((game) => {
      if (game.nonCompletable === true) {
        nonCompletable.push(game);
      } else if (game.progress === 100) {
        completed.push(game);
      } else if (game.planned === true) {
        // planned flag legyen magasabb prioritású mint a progress
        planned.push(game);
      } else if (
        typeof game.progress === "number" &&
        game.progress > 0 &&
        game.progress < 100
      ) {
        inprogress.push(game);
      } else {
        // minden más eset (progress 0, null, undefined)
        planned.push(game);
      }
    });

    gamesContainer.innerHTML = `
        ${createSection(
          "Jelenleg futó végigjátszások",
          inprogress,
          "inprogress"
        )}
        ${createSection("Befejezett végigjátszások", completed, "completed")}
        ${createSection("Tervezett játékok", planned, "planned")}
        ${createSection(
          "Nem befejezhető játékok",
          nonCompletable,
          "noncompletable"
        )}
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

  function createGameCard(game) {
    const isNew = checkIfNew(game.dateAdded);
    const isPrePurchase = Array.isArray(game.developmentStatus)
      ? game.developmentStatus.includes("pre-purchase")
      : game.developmentStatus === "pre-purchase";
    const hasProgress = typeof game.progress === "number";

    // Force flags alapján kategória meghatározása
    let status = "planned"; // Alapértelmezett

    if (game.forceNonCompletable) {
      status = "noncompletable";
    } else if (game.forceCompleted) {
      status = "completed";
    } else if (game.forceInProgress) {
      status = "inprogress";
    } else if (game.forcePlanned) {
      status = "planned";
    } else if (game.nonCompletable) {
      status = "noncompletable";
    } else if (game.progress === 100) {
      status = "completed";
    } else if (game.planned) {
      status = "planned";
    } else if (game.progress > 0 && game.progress < 100) {
      status = "inprogress";
    }

    let countdownHTML = "";
    if (isPrePurchase && game.releaseDates) {
      const fullRelease = game.releaseDates.find(
        (rd) => rd.type === "full-release"
      );
      if (fullRelease) {
        const gameTitleId = game.title
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase();
        countdownHTML = `
                    <div class="countdown-container">
                        <div id="countdown-${gameTitleId}"
                             class="countdown-timer"
                             data-release-date="${fullRelease.date}">
                        </div>
                    </div>
                `;
      }
    }

    return `
            <div class="game-card" data-status="${status}">
                <div class="game-cover">
                    <img src="${getCoverUrl(game)}"
                         alt="${game.title}"
                         onerror="if (!this.dataset.fallback) { this.dataset.fallback = 'true'; this.src='${
                           game.cover || CONFIG.fallbackImage
                         }'; }">
                    ${isNew ? '<div class="new-badge">ÚJ</div>' : ""}
                    ${
                      isPrePurchase
                        ? '<div class="pre-purchase-badge">ELŐRENDELHETŐ</div>'
                        : ""
                    }
                    <div class="game-actions">
                        ${createActionButtons(game)}
                    </div>
                </div>
                <div class="game-info">
                    ${countdownHTML}
                    <div class="game-header">
                        <h3 class="game-title">${game.title}</h3>
                        ${
                          hasProgress
                            ? `<div class="game-progress">${game.progress}%</div>`
                            : ""
                        }
                    </div>
                    ${createGameDetails(game)}
                    ${
                      hasProgress
                        ? `
                        <div class="progress-bar" data-progress="${game.progress}">
                            <div class="progress-fill"></div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  function initCountdowns() {
    document.querySelectorAll(".countdown-timer").forEach((timer) => {
      const releaseDate = new Date(timer.dataset.releaseDate);
      const now = new Date();

      // Clear any existing interval
      if (timer.dataset.intervalId) {
        clearInterval(parseInt(timer.dataset.intervalId));
      }

      const updateCountdown = () => {
        const diff = releaseDate - new Date();

        if (diff <= 0) {
          timer.textContent = "MEGJELENT!";
          timer.classList.add("released");
          if (timer.dataset.intervalId) {
            clearInterval(parseInt(timer.dataset.intervalId));
          }
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        timer.textContent = `${days} nap ${hours} óra ${minutes} perc ${seconds} másodperc`;
      };

      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000);

      // Store intervalId on element for cleanup
      timer.dataset.intervalId = intervalId;
    });
  }

  function createActionButtons(game) {
    const playstationUrl = game.playstationStoreId
      ? game.playstationStoreType === "product"
        ? `https://store.playstation.com/en-us/product/${game.playstationStoreId}`
        : `https://store.playstation.com/en-us/concept/${game.playstationStoreId}`
      : null;

    const coverUrl = getCoverUrl(game);

    return `
    ${
      game.steamId
        ? `<button class="action-btn steam-btn" onclick="window.open('https://store.steampowered.com/app/${game.steamId}', '_blank')" title="Steam"><i class="fab fa-steam"></i></button>`
        : ""
    }
    ${
      playstationUrl
        ? `<button class="action-btn ps-btn" onclick="window.open('${playstationUrl}', '_blank')" title="PlayStation Store"><i class="fab fa-playstation"></i></button>`
        : ""
    }
    ${
      game.xboxStoreId
        ? `<button class="action-btn xbox-btn" onclick="window.open('https://www.xbox.com/en-us/games/store/${game.xboxStoreId}', '_blank')" title="Xbox Store"><i class="fab fa-xbox"></i></button>`
        : ""
    }
    ${
      game.googlePlayStoreId
        ? `<button class="action-btn google-btn" onclick="window.open('https://play.google.com/store/apps/details?id=${game.googlePlayStoreId}', '_blank')" title="Google PlayStore"><i class="fab fa-google-play"></i></button>`
        : ""
    }
    ${
      game.epicGamesId
        ? `<button class="action-btn epic-btn" onclick="window.open('https://store.epicgames.com/en-US/p/${game.epicGamesId}', '_blank')" title="Epic Games">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" style="vertical-align:middle;">
              <path d="M4.719 0c-1.833 0-2.505 0.677-2.505 2.505v22.083c0 0.209 0.011 0.401 0.027 0.579 0.047 0.401 0.047 0.792 0.421 1.229 0.036 0.052 0.412 0.328 0.412 0.328 0.203 0.099 0.343 0.172 0.572 0.265l11.115 4.656c0.573 0.261 0.819 0.371 1.235 0.355h0.005c0.421 0.016 0.667-0.093 1.24-0.355l11.109-4.656c0.235-0.093 0.369-0.167 0.577-0.265 0 0 0.376-0.287 0.412-0.328 0.375-0.437 0.375-0.828 0.421-1.229 0.016-0.177 0.027-0.369 0.027-0.573v-22.088c0-1.828-0.677-2.505-2.505-2.505zM22.527 4.145h0.905c1.511 0 2.251 0.735 2.251 2.267v2.505h-1.833v-2.407c0-0.489-0.224-0.713-0.699-0.713h-0.312c-0.489 0-0.713 0.224-0.713 0.713v7.749c0 0.489 0.224 0.713 0.713 0.713h0.349c0.468 0 0.692-0.224 0.692-0.713v-2.771h1.833v2.86c0 1.525-0.749 2.276-2.265 2.276h-0.921c-1.521 0-2.267-0.756-2.267-2.276v-7.923c0-1.525 0.745-2.281 2.267-2.281zM6.276 4.251h4.151v1.703h-2.287v3.468h2.204v1.699h-2.204v3.697h2.319v1.704h-4.183zM11.364 4.251h2.928c1.515 0 2.265 0.755 2.265 2.28v3.261c0 1.525-0.751 2.276-2.265 2.276h-1.057v4.453h-1.871zM17.401 4.251h1.864v12.271h-1.864zM13.229 5.901v4.52h0.771c0.469 0 0.693-0.228 0.693-0.719v-3.083c0-0.489-0.224-0.719-0.693-0.719zM8.088 19.437h0.276l0.063 0.011h0.1l0.052 0.016h0.052l0.047 0.015 0.052 0.011 0.041 0.011 0.093 0.021 0.053 0.015 0.036 0.011 0.041 0.016 0.052 0.016 0.036 0.015 0.053 0.021 0.047 0.021 0.041 0.025 0.047 0.021 0.036 0.025 0.053 0.027 0.041 0.025 0.041 0.021 0.041 0.031 0.043 0.027 0.036 0.031 0.125 0.095-0.032 0.041-0.036 0.036-0.032 0.037-0.036 0.041-0.025 0.036-0.032 0.037-0.036 0.036-0.032 0.041-0.025 0.036-0.037 0.043-0.031 0.036-0.036 0.041-0.032 0.037-0.025 0.041-0.037 0.036-0.031 0.043-0.036 0.036-0.032 0.036-0.036-0.025-0.041-0.037-0.043-0.025-0.077-0.052-0.047-0.027-0.043-0.025-0.047-0.027-0.036-0.021-0.041-0.020-0.084-0.032-0.052-0.009-0.041-0.011-0.047-0.011-0.053-0.011-0.052-0.005h-0.052l-0.061-0.011h-0.1l-0.052 0.005h-0.052l-0.052 0.016-0.041 0.011-0.047 0.016-0.047 0.009-0.043 0.021-0.052 0.021-0.072 0.052-0.043 0.025-0.036 0.032-0.036 0.025-0.037 0.032-0.025 0.036-0.043 0.036-0.052 0.073-0.025 0.041-0.021 0.047-0.025 0.037-0.027 0.047-0.016 0.047-0.020 0.041-0.016 0.052-0.005 0.052-0.015 0.048-0.011 0.052v0.052l-0.005 0.052v0.12l0.005 0.052v0.041l0.005 0.052 0.009 0.047 0.016 0.041 0.005 0.053 0.016 0.041 0.015 0.036 0.021 0.052 0.027 0.052 0.020 0.037 0.052 0.083 0.032 0.041 0.025 0.037 0.043 0.031 0.025 0.036 0.036 0.032 0.084 0.063 0.036 0.020 0.041 0.027 0.048 0.021 0.052 0.020 0.036 0.021 0.104 0.031 0.047 0.005 0.052 0.016 0.052 0.005h0.224l0.063-0.005h0.047l0.053-0.021 0.052-0.005 0.052-0.015 0.041-0.011 0.047-0.021 0.041-0.020 0.047-0.021 0.032-0.021 0.041-0.025v-0.464h-0.735v-0.744h1.661v1.667l-0.036 0.025-0.036 0.031-0.037 0.027-0.041 0.031-0.041 0.021-0.036 0.032-0.084 0.052-0.052 0.025-0.083 0.052-0.053 0.021-0.041 0.020-0.047 0.021-0.104 0.041-0.041 0.021-0.095 0.031-0.047 0.011-0.047 0.016-0.052 0.016-0.041 0.009-0.156 0.032-0.048 0.005-0.104 0.011-0.057 0.005-0.052 0.004-0.057 0.005h-0.26l-0.052-0.009h-0.052l-0.052-0.011h-0.047l-0.052-0.016-0.152-0.031-0.041-0.016-0.047-0.005-0.052-0.021-0.095-0.031-0.093-0.041-0.052-0.021-0.036-0.021-0.052-0.020-0.037-0.032-0.052-0.020-0.031-0.027-0.041-0.025-0.084-0.063-0.041-0.027-0.032-0.031-0.041-0.032-0.068-0.067-0.036-0.032-0.031-0.036-0.037-0.037-0.025-0.041-0.032-0.031-0.025-0.043-0.032-0.041-0.025-0.036-0.027-0.041-0.025-0.048-0.021-0.041-0.021-0.047-0.020-0.041-0.041-0.095-0.016-0.036-0.021-0.047-0.011-0.047-0.009-0.041-0.011-0.052-0.016-0.048-0.011-0.052-0.005-0.041-0.009-0.052-0.011-0.093-0.011-0.104v-0.276l0.011-0.053v-0.052l0.016-0.052v-0.052l0.015-0.047 0.016-0.052 0.021-0.093 0.015-0.052 0.016-0.047 0.063-0.141 0.020-0.041 0.021-0.047 0.027-0.048 0.020-0.041 0.027-0.036 0.052-0.084 0.031-0.041 0.032-0.036 0.025-0.041 0.068-0.068 0.031-0.037 0.037-0.036 0.031-0.036 0.043-0.032 0.072-0.063 0.041-0.031 0.043-0.027 0.036-0.031 0.041-0.027 0.043-0.020 0.047-0.027 0.052-0.025 0.036-0.027 0.052-0.020 0.047-0.021 0.047-0.025 0.043-0.011 0.052-0.016 0.041-0.021 0.047-0.009 0.047-0.016 0.052-0.011 0.043-0.016 0.052-0.011h0.052l0.047-0.015h0.052l0.052-0.011h0.047zM24.073 19.448h0.276l0.063 0.011h0.099l0.052 0.015h0.057l0.052 0.016 0.093 0.021 0.052 0.011 0.047 0.009 0.053 0.016 0.047 0.016 0.041 0.011 0.047 0.015 0.052 0.016 0.041 0.021 0.052 0.020 0.048 0.021 0.047 0.027 0.036 0.020 0.047 0.027 0.047 0.020 0.043 0.027 0.047 0.031 0.036 0.027 0.084 0.063 0.041 0.025-0.032 0.041-0.025 0.043-0.031 0.036-0.032 0.041-0.025 0.047-0.027 0.043-0.031 0.036-0.032 0.041-0.025 0.043-0.032 0.041-0.025 0.036-0.032 0.041-0.025 0.048-0.032 0.041-0.031 0.036-0.032 0.041-0.025 0.043-0.041-0.032-0.048-0.025-0.036-0.027-0.041-0.025-0.047-0.021-0.043-0.027-0.047-0.020-0.036-0.021-0.052-0.020-0.037-0.021-0.041-0.016-0.093-0.031-0.104-0.032-0.156-0.031-0.052-0.005-0.095-0.011h-0.109l-0.057 0.011-0.052 0.011-0.047 0.011-0.041 0.020-0.037 0.021-0.041 0.036-0.031 0.047-0.021 0.048v0.124l0.027 0.057 0.020 0.032 0.032 0.031 0.052 0.027 0.041 0.025 0.047 0.021 0.052 0.020 0.068 0.016 0.036 0.016 0.043 0.011 0.052 0.011 0.041 0.015 0.047 0.011 0.057 0.016 0.052 0.016 0.057 0.015 0.057 0.011 0.047 0.016 0.057 0.015 0.052 0.011 0.047 0.011 0.157 0.047 0.041 0.016 0.052 0.016 0.047 0.020 0.052 0.027 0.104 0.041 0.047 0.027 0.084 0.052 0.077 0.057 0.048 0.031 0.036 0.036 0.036 0.043 0.037 0.036 0.025 0.036 0.037 0.052 0.025 0.037 0.021 0.052 0.020 0.031 0.016 0.052 0.016 0.043 0.011 0.047 0.020 0.104 0.005 0.052 0.005 0.047v0.125l-0.005 0.057-0.011 0.104-0.011 0.052-0.015 0.047-0.011 0.052-0.016 0.052-0.015 0.047-0.021 0.037-0.021 0.047-0.025 0.041-0.032 0.037-0.052 0.083-0.063 0.073-0.036 0.025-0.041 0.037-0.032 0.031-0.041 0.031-0.041 0.021-0.041 0.032-0.048 0.025-0.093 0.047-0.052 0.021-0.047 0.020-0.052 0.016-0.047 0.016-0.043 0.011-0.104 0.020-0.036 0.011-0.052 0.011h-0.052l-0.047 0.011h-0.052l-0.052 0.011h-0.371l-0.156-0.016-0.052-0.011-0.047-0.005-0.104-0.020-0.057-0.011-0.047-0.011-0.052-0.016-0.053-0.011-0.047-0.015-0.052-0.016-0.052-0.021-0.041-0.015-0.052-0.016-0.052-0.021-0.037-0.020-0.052-0.016-0.041-0.027-0.052-0.020-0.041-0.027-0.037-0.025-0.052-0.027-0.036-0.020-0.041-0.032-0.041-0.025-0.043-0.032-0.036-0.031-0.041-0.032-0.037-0.025-0.041-0.037 0.032-0.041 0.036-0.036 0.031-0.037 0.037-0.041 0.025-0.036 0.032-0.041 0.036-0.037 0.031-0.036 0.037-0.041 0.025-0.037 0.037-0.036 0.031-0.041 0.032-0.037 0.036-0.041 0.025-0.036 0.037-0.037 0.036-0.041 0.036 0.032 0.048 0.031 0.036 0.031 0.052 0.027 0.036 0.027 0.047 0.031 0.043 0.027 0.047 0.020 0.036 0.027 0.047 0.015 0.052 0.021 0.043 0.021 0.047 0.015 0.041 0.021 0.052 0.016 0.047 0.015 0.052 0.016 0.052 0.005 0.048 0.016 0.052 0.005h0.057l0.047 0.015h0.281l0.047-0.009 0.052-0.011 0.036-0.005 0.043-0.016 0.036-0.020 0.047-0.032 0.027-0.036 0.020-0.041 0.016-0.048v-0.12l-0.021-0.047-0.025-0.041-0.032-0.031-0.047-0.032-0.036-0.015-0.047-0.021-0.052-0.021-0.057-0.025-0.037-0.011-0.041-0.011-0.052-0.016-0.036-0.009-0.052-0.016-0.052-0.005-0.053-0.021-0.052-0.005-0.057-0.015-0.047-0.011-0.052-0.016-0.052-0.011-0.052-0.015-0.047-0.016-0.052-0.011-0.041-0.016-0.095-0.031-0.052-0.021-0.052-0.015-0.104-0.043-0.047-0.025-0.052-0.027-0.036-0.025-0.048-0.027-0.036-0.025-0.047-0.027-0.068-0.068-0.036-0.031-0.063-0.073-0.027-0.036-0.020-0.036-0.032-0.048-0.015-0.036-0.048-0.125-0.009-0.052-0.011-0.047v-0.047l-0.011-0.052v-0.213l0.011-0.104 0.011-0.043 0.009-0.047 0.016-0.041 0.011-0.052 0.021-0.036 0.020-0.053 0.021-0.041 0.020-0.052 0.027-0.036 0.036-0.041 0.027-0.043 0.041-0.036 0.031-0.036 0.032-0.043 0.047-0.036 0.032-0.027 0.041-0.031 0.083-0.052 0.047-0.027 0.095-0.047 0.041-0.015 0.047-0.016 0.052-0.021 0.052-0.015 0.037-0.011 0.047-0.011 0.041-0.011 0.047-0.011 0.052-0.011 0.104-0.009 0.048-0.005zM11.755 19.484h0.943l0.043 0.095 0.020 0.041 0.016 0.052 0.021 0.047 0.015 0.041 0.027 0.047 0.031 0.095 0.027 0.047 0.041 0.093 0.011 0.041 0.083 0.188 0.016 0.047 0.021 0.043 0.025 0.047 0.011 0.047 0.027 0.052 0.009 0.047 0.048 0.093 0.020 0.037 0.021 0.052 0.016 0.052 0.015 0.036 0.027 0.052 0.016 0.043 0.020 0.052 0.016 0.036 0.021 0.052 0.047 0.093 0.015 0.047 0.011 0.048 0.021 0.047 0.025 0.041 0.021 0.052 0.021 0.047 0.015 0.041 0.043 0.095 0.015 0.047 0.021 0.047 0.016 0.047 0.020 0.041 0.027 0.048 0.020 0.047 0.021 0.041 0.011 0.052 0.041 0.093 0.021 0.043 0.015 0.047 0.043 0.093 0.025 0.052 0.011 0.041 0.027 0.053 0.009 0.036 0.021 0.052 0.027 0.052 0.020 0.036 0.016 0.052 0.021 0.043 0.015 0.052 0.027 0.036 0.031 0.104 0.021 0.037 0.020 0.052 0.027 0.041 0.021 0.052 0.009 0.047 0.016 0.041 0.021 0.047 0.025 0.043h-1.041l-0.025-0.043-0.016-0.047-0.021-0.047-0.020-0.052-0.011-0.041-0.043-0.093-0.015-0.043-0.041-0.093-0.016-0.041-0.021-0.052-0.031-0.095-0.021-0.041h-1.448l-0.020 0.047-0.016 0.043-0.021 0.052-0.020 0.047-0.011 0.041-0.021 0.052-0.020 0.041-0.016 0.047-0.021 0.043-0.020 0.052-0.016 0.036-0.021 0.052-0.015 0.052-0.021 0.037-0.016 0.052h-1.031l0.015-0.048 0.043-0.093 0.015-0.052 0.016-0.041 0.027-0.047 0.020-0.047 0.021-0.043 0.011-0.047 0.020-0.052 0.027-0.041 0.020-0.047 0.032-0.095 0.047-0.093 0.016-0.047 0.020-0.041 0.016-0.048 0.063-0.14 0.021-0.052 0.015-0.041 0.016-0.047 0.027-0.043 0.020-0.052 0.016-0.047 0.016-0.041 0.020-0.052 0.027-0.037 0.016-0.052 0.020-0.041 0.016-0.047 0.021-0.052 0.025-0.041 0.016-0.052 0.020-0.037 0.016-0.052 0.021-0.052 0.020-0.036 0.021-0.052 0.016-0.043 0.020-0.052 0.016-0.036 0.027-0.052 0.020-0.052 0.021-0.041 0.011-0.047 0.020-0.048 0.027-0.047 0.020-0.041 0.011-0.052 0.021-0.047 0.021-0.043 0.041-0.093 0.015-0.041 0.043-0.104 0.020-0.037 0.021-0.052 0.016-0.041 0.015-0.052 0.021-0.047 0.027-0.041 0.020-0.052 0.016-0.037 0.016-0.052 0.020-0.041 0.027-0.047 0.016-0.052 0.015-0.043 0.021-0.052 0.020-0.036 0.027-0.052 0.016-0.052 0.015-0.036 0.021-0.052zM14.683 19.511h1.031l0.032 0.041 0.052 0.084 0.025 0.047 0.027 0.036 0.025 0.047 0.027 0.041 0.025 0.048 0.027 0.041 0.025 0.036 0.027 0.047 0.025 0.043 0.037 0.041 0.015 0.041 0.032 0.047 0.025 0.043 0.032 0.036 0.021 0.047 0.025 0.041 0.032 0.043 0.015 0.041 0.037 0.047 0.077 0.125 0.021 0.041 0.031 0.041 0.027 0.041 0.025 0.048 0.079 0.124 0.025 0.048 0.027 0.041 0.031-0.041 0.021-0.053 0.031-0.036 0.027-0.047 0.025-0.036 0.021-0.052 0.036-0.037 0.027-0.047 0.021-0.036 0.025-0.043 0.032-0.047 0.025-0.036 0.027-0.052 0.025-0.036 0.032-0.048 0.020-0.036 0.027-0.052 0.025-0.031 0.027-0.043 0.031-0.052 0.027-0.036 0.020-0.047 0.032-0.037 0.025-0.052 0.027-0.031 0.031-0.041 0.027-0.052 0.025-0.037 0.027-0.047 0.025-0.036 0.027-0.052 0.031-0.037 0.021-0.047 0.027-0.036h1.047v3.719h-0.98v-2.188l-0.025 0.037-0.032 0.052-0.025 0.031-0.032 0.041-0.020 0.052-0.032 0.037-0.025 0.036-0.032 0.052-0.052 0.073-0.031 0.041-0.027 0.052-0.031 0.037-0.027 0.036-0.020 0.052-0.032 0.036-0.025 0.037-0.032 0.052-0.025 0.036-0.032 0.041-0.025 0.047-0.021 0.037-0.031 0.041-0.027 0.047-0.031 0.036-0.032 0.043-0.020 0.041-0.027 0.047-0.031 0.037-0.032 0.041-0.020 0.052-0.037 0.031-0.020 0.041-0.032 0.053-0.025 0.036h-0.021l-0.031-0.047-0.027-0.043-0.025-0.047-0.027-0.036-0.031-0.047-0.027-0.041-0.031-0.043-0.027-0.041-0.025-0.047-0.027-0.036-0.036-0.048-0.021-0.041-0.031-0.047-0.027-0.036-0.025-0.047-0.032-0.043-0.025-0.052-0.032-0.036-0.025-0.047-0.027-0.043-0.025-0.047-0.032-0.036-0.025-0.047-0.032-0.041-0.020-0.043-0.032-0.041-0.025-0.047-0.032-0.036-0.025-0.048-0.032-0.041-0.020-0.047-0.037-0.036-0.020-0.048-0.032-0.041v2.193h-0.963v-3.683zM19.307 19.511h2.933v0.839h-1.959v0.599h1.76v0.792h-1.76v0.635h1.984v0.844h-2.953v-3.677zM12.213 20.651l-0.016 0.047-0.015 0.043-0.021 0.052-0.021 0.047-0.015 0.047-0.043 0.093-0.020 0.052-0.016 0.043-0.016 0.052-0.020 0.036-0.016 0.052-0.021 0.052-0.020 0.037-0.016 0.052-0.020 0.041-0.016 0.052-0.027 0.047-0.011 0.041-0.020 0.052-0.021 0.048-0.016 0.041-0.020 0.052h0.859l-0.020-0.052-0.016-0.047-0.041-0.095-0.016-0.047-0.021-0.041-0.015-0.052-0.021-0.047-0.016-0.047-0.020-0.043-0.016-0.047-0.021-0.052-0.015-0.041-0.043-0.093-0.009-0.048-0.021-0.047-0.021-0.052-0.015-0.036-0.043-0.104-0.015-0.047zM10.683 27.615h10.681l-5.452 1.797z"/>
            </svg>
          </button>`
        : ""
    }
    ${
      game.humbleId
        ? `<button class="action-btn humble-btn" onclick="window.open('https://www.humblebundle.com/store/${game.humbleId}', '_blank')" title="Humble Bundle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;">
              <title>Humble Bundle icon</title>
              <path d="M4.145 23.996c.12-.463.23-.9.343-1.338.692-2.713 1.322-5.44 1.82-8.197.245-1.35.446-2.71.633-4.074.142-1.028.217-2.064.198-3.105-.01-.557-.034-1.116-.193-1.655-.07-.24-.174-.473-.3-.686-.165-.273-.43-.378-.75-.368-.883.026-1.633.363-2.272.96-.727.68-1.202 1.527-1.553 2.445-.166.435-.284.887-.422 1.33-.02.066-.026.123-.115.122C1.04 9.424.545 9.425.05 9.424c-.013 0-.024-.008-.036-.01 0-.193-.02-.385.003-.572.346-2.853 1.57-5.267 3.668-7.226C4.47.882 5.4.373 6.462.142 8.017-.196 9.258.4 9.996 1.822c.375.72.578 1.496.71 2.293.21 1.287.218 2.586.175 3.885-.014.42-.04.84-.062 1.26-.002.054 0 .108 0 .176.057.003.105.008.154.008.905 0 1.81-.002 2.717.005.124 0 .16-.047.18-.16.575-3.113 1.367-6.17 2.39-9.166.024-.074.05-.124.147-.124 1.12.004 2.24.004 3.362.004.017 0 .035.004.07.008l-.193.753C18.89 3.7 18.21 6.65 17.66 9.628c-.288 1.546-.533 3.1-.69 4.664-.086.875-.14 1.752-.113 2.63.016.53.054 1.062.22 1.57.064.202.16.4.273.58.167.26.426.366.74.356 1.16-.033 2.042-.59 2.746-1.47.707-.88 1.133-1.9 1.434-2.98.028-.1.06-.202.076-.306.014-.082.054-.104.13-.104.467.002.933.004 1.4 0 .102-.002.12.043.117.13-.014.804-.157 1.583-.39 2.347-.59 1.928-1.557 3.635-2.992 5.06-.813.81-1.762 1.407-2.88 1.706-.677.183-1.355.212-2.025-.028-.76-.27-1.276-.816-1.66-1.504-.402-.725-.613-1.512-.75-2.322-.24-1.406-.24-2.824-.172-4.242.042-.89.127-1.777.193-2.666.014-.19.016-.19-.174-.19-.855 0-1.71.002-2.566-.002-.104 0-.153.024-.17.137-.27 1.813-.637 3.608-1.074 5.387-.453 1.842-.974 3.664-1.587 5.46-.044.127-.104.16-.233.16-1.065-.006-2.13-.004-3.197-.004h-.17z"/>
            </svg>
          </button>`
        : ""
    }
    ${
      game.itchId
        ? `<button class="action-btn itch-btn" onclick="window.open('https://${game.itchId}.itch.io', '_blank')" title="itch.io"><i class="fab fa-itch-io"></i></button>`
        : ""
    }
    ${
      game.gogId
        ? `<button class="action-btn gog-btn" onclick="window.open('https://www.gog.com/game/${game.gogId}', '_blank')" title="GOG.com">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;">
              <rect width="24" height="24" rx="4" fill="#5c2d91"/>
              <text x="12" y="16" text-anchor="middle" font-size="10" fill="#fff" font-family="Arial, sans-serif">GOG</text>
            </svg>
          </button>`
        : ""
    }
    ${
      game.videoId
        ? `<button class="action-btn youtube-btn" onclick="showTrailer('${game.videoId}', '${coverUrl}')"><i class="fab fa-youtube"></i></button>`
        : ""
    }
  `;
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createGameDetails(game) {
    let releaseDatesHtml = "";
    if (game.releaseDates && Array.isArray(game.releaseDates)) {
      game.releaseDates.forEach((release) => {
        // Több platform támogatása, ikonokkal
        const platformIcons = {
          pc: '<i class="fab fa-windows"></i> PC',
          ps: '<i class="fab fa-playstation"></i> PlayStation',
          xbox: '<i class="fab fa-xbox"></i> Xbox',
          switch: '<i class="fas fa-gamepad"></i> Nintendo Switch',
          mobile: '<i class="fab fa-android"></i> Mobil',
          mac: '<i class="fab fa-apple"></i> Mac',
          linux: '<i class="fab fa-linux"></i> Linux'
        };

        // Ha több platform van, tömbként kezeljük
        const platforms = Array.isArray(release.platform)
          ? release.platform
          : [release.platform];

        const platformLabel = platforms
          .filter(Boolean)
          .map(
            (p) =>
              `<span class="platform-label platform-${p}">${platformIcons[p] || p}</span>`
          )
          .join(", ");

        const typeLabel =
          {
            "full-release": "Teljes kiadás",
            "early-access": "Korai hozzáférés",
            remastered: "Remastered",
            "server-closed": "Leállított szerverek",
            "in-development": "Fejlesztés alatt",
          }[release.type] || release.type;

        releaseDatesHtml += `
          <div class="release-date ${release.type?.toLowerCase().replace(" ", "-")}${release.platform ? " platformed" : ""}">
            ${
              release.platform
                ? `${platformLabel} – ${typeLabel}: ${formatDate(release.date)}`
                : `${typeLabel}: ${formatDate(release.date)}`
            }
          </div>
        `;
      });
    } else if (game.releaseDate) {
      releaseDatesHtml = `
        <div class="release-date">
          Megjelenés: ${formatDate(game.releaseDate)}
        </div>
      `;
    }

    let developmentStatusHtml = "";
    if (game.developmentStatus && Array.isArray(game.developmentStatus)) {
      developmentStatusHtml = `
              <div class="game-detail-row">
                  <div class="development-status-container">
                      ${game.developmentStatus
                        .map(
                          (status) => `
                          <div class="development-status ${status}">
                              <i class="fas ${getStatusIcon(status)}"></i>
                              ${getStatusText(status)}
                          </div>
                      `
                        )
                        .join("")}
                  </div>
              </div>
          `;
    } else if (game.developmentStatus) {
      developmentStatusHtml = `
              <div class="game-detail-row">
                  <div class="development-status-container">
                      <div class="development-status ${game.developmentStatus}">
                          <i class="fas ${getStatusIcon(game.developmentStatus)}"></i>
                          ${getStatusText(game.developmentStatus)}
                      </div>
                  </div>
              </div>
          `;
    }
    
    let commentHtml = "";
    const commentSource = game.comment || (Array.isArray(game.comments) ? game.comments.join("; ") : game.comments);
    if (commentSource) {
      commentHtml = `
      <div class="game-detail-row">
        <div class="game-comment">
          <div class="comment-header">
            <i class="fas fa-sticky-note"></i>
            <span class="comment-label">Megjegyzés:</span>
          </div>
          <span class="comment-text">${escapeHtml(commentSource)}</span>
        </div>
      </div>
      `;
    }

    return `
          <div class="game-details">
              ${
                game.platforms && game.platforms.length > 0
                  ? `
                  <div class="game-detail-row">
                      <div class="platform-tags">
                          ${createPlatformTag(game)}
                      </div>
                  </div>
              `
                  : ""
              }
              ${
                game.multiplayer &&
                Array.isArray(game.multiplayer) &&
                game.multiplayer.length > 0
                  ? `
                  <div class="game-detail-row">
                      <div class="multiplayer-tags">
                          ${game.multiplayer
                            .map(
                              (mode) => `
                              <div class="multiplayer-tag ${mode}">
                                  <i class="fas ${
                                    mode === "local"
                                      ? "fa-users"
                                      : mode === "singleplayer"
                                      ? "fa-user"
                                      : "fa-globe"
                                  }"></i>
                                  ${
                                    mode === "local"
                                      ? "Helyi többjátékos"
                                      : mode === "singleplayer"
                                      ? "Egyjátékos mód"
                                      : "Online többjátékos"
                                  }
                              </div>
                          `
                            )
                            .join("")}
                      </div>
                  </div>
              `
                  : ""
              }
              ${developmentStatusHtml}
              ${releaseDatesHtml}
              ${
                game.progress === 100 && game.finishDate
                  ? `
                  <div class="game-detail-row">
                      <div class="finished-date">
                          Végigjátszva: ${formatDate(game.finishDate)}
                      </div>
                  </div>
              `
                  : ""
              }
              ${
                game.playTime
                  ? `
                  <div class="game-detail-row">
                      <div class="playtime">
                          <i class="fas fa-clock"></i> Játékidő: ${game.playTime}
                      </div>
                  </div>
              `
                  : ""
              }
              ${
                game.developer
                  ? `
                  <div class="game-detail-row">
                      <div class="developer-tags">
                          ${(Array.isArray(game.developer)
                            ? game.developer
                            : [game.developer]
                          )
                            .filter((dev) => dev)
                            .map(
                              (dev) =>
                                `<span class="developer-tag">${escapeHtml(dev)}</span>`
                            )
                            .join("")}
                      </div>
                  </div>
              `
                  : ""
              }
              ${commentHtml}
              <div class="game-detail-row">
                  <div class="category-tags">${game.category
                    .map((cat) => `<span class="category-tag">${escapeHtml(cat)}</span>`)
                    .join("")}</div>
              </div>
          </div>
      `;
  }

  function createPlatformTag(game) {
    let platformTags = "";
    const platformsSet = new Set();

    if (game.platforms) {
      game.platforms.forEach((platform) => {
        const platformLower = platform.toLowerCase();
        if (platformLower.includes("pc")) platformsSet.add("pc");
        if (platformLower.includes("playstation") || platformLower.includes("ps")) platformsSet.add("ps");
        if (platformLower.includes("xbox")) platformsSet.add("xbox");
        if (platformLower.includes("android") || platformLower.includes("mobile")) platformsSet.add("mobile");
        if (platformLower.includes("switch") || platformLower.includes("nintendo")) platformsSet.add("switch");
        if (platformLower.includes("mac")) platformsSet.add("mac");
        if (platformLower.includes("linux")) platformsSet.add("linux");
      });
    }

    const icons = {
      pc: '<span class="platform-tag" title="PC"><i class="fab fa-windows"></i></span>',
      ps: '<span class="platform-tag" title="PlayStation"><i class="fab fa-playstation"></i></span>',
      xbox: '<span class="platform-tag" title="Xbox"><i class="fab fa-xbox"></i></span>',
      mobile: '<span class="platform-tag" title="Mobil/Android"><i class="fab fa-android"></i></span>',
      switch: '<span class="platform-tag" title="Nintendo Switch"><i class="fas fa-gamepad"></i></span>',
      mac: '<span class="platform-tag" title="Mac"><i class="fab fa-apple"></i></span>',
      linux: '<span class="platform-tag" title="Linux"><i class="fab fa-linux"></i></span>',
    };

    platformsSet.forEach((p) => {
      platformTags += icons[p] || "";
    });

    if (game.hasDLC) {
      platformTags += `
      <span class="dlc-tag">
        <span class="dlc-icon"><i class="fas fa-puzzle-piece"></i></span>
        <span class="dlc-text">DLC</span>
      </span>
    `;
    }

    return platformTags;
  }

  function getStatusIcon(status) {
    const icons = {
      "in-development": "fa-tools",
      "early-access": "fa-exclamation-triangle",
      "server-closed": "fa-server",
      remastered: "fa-redo-alt",
      "pre-purchase": "fa-shopping-cart",
      "full-release": "fa-check-circle",
    };
    return icons[status] || "fa-info-circle";
  }

  function getStatusText(status) {
    const texts = {
      "in-development": "Fejlesztés alatt",
      "early-access": "Korai hozzáférés",
      "server-closed": "Leállított szerverek",
      remastered: "Remastered változat",
      released: "Megjelent",
      "full-release": "Teljes kiadás",
      "pre-purchase": "Előrendelhető",
    };
    return texts[status] || "Ismeretlen állapot";
  }

  function checkIfNew(date) {
    if (!date) return false;
    const addedDate = new Date(date);
    const today = new Date();
    const diffTime = today - addedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  }

  function formatDate(dateString) {
    if (!dateString) return "Nincs adat";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("hu-HU", options);
  }

  searchInput.addEventListener("input", updateFilters);
  categorySelect.addEventListener("change", updateFilters);
  developerSelect.addEventListener("change", updateFilters);
  statusSelect.addEventListener("change", updateFilters);

  window.showTrailer = (videoId, coverUrl) => {
    const modal = document.getElementById("trailerModal");
    const trailerFrame = document.getElementById("trailerFrame");

    // Háttérkép beállítása
    let coverBackground = modal.querySelector(".modal-cover-background");
    if (!coverBackground) {
      coverBackground = document.createElement("div");
      coverBackground.className = "modal-cover-background";
      modal.insertBefore(coverBackground, modal.firstChild);
    }
    coverBackground.style.backgroundImage = `url(${
      coverUrl || CONFIG.fallbackImage
    })`;

    // Modal stílus beállítása
    modal.classList.add("with-cover");
    trailerFrame.src = `${CONFIG.youtubeEmbedUrl}${videoId}?autoplay=1`;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  };

  function closeModal() {
    const modal = document.getElementById("trailerModal");
    const trailerFrame = document.getElementById("trailerFrame");

    modal.style.display = "none";
    trailerFrame.src = "";
    document.body.style.overflow = "";
    modal.classList.remove("with-cover");
  }

  modalClose.addEventListener("click", closeModal);

  window.addEventListener("click", (event) => {
    if (event.target === trailerModal) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  loadGames();
}

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("currentYear");
  yearSpan.textContent = new Date().getFullYear();
});
