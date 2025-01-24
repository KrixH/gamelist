document.addEventListener("DOMContentLoaded", () => {
  const randomGameTrigger = document.getElementById("randomGameTrigger");
  const randomGameContainer = document.getElementById("randomGameContainer");
  const randomGameCover = document.getElementById("randomGameCover");
  const randomGameTitle = document.getElementById("randomGameTitle");
  const closeRandomGame = document.getElementById("closeRandomGame");

  let hasSpun = false;

  // Dobókocka gomb eseménykezelő
  randomGameTrigger.addEventListener("click", () => {
    if (!hasSpun) {
      randomGameContainer.classList.add("show");
      hasSpun = true;
    }
    selectRandomGame(); // Kiválaszt egy véletlenszerű játékot
  });

  // Bezárás gomb eseménykezelő
  closeRandomGame.addEventListener("click", () => {
    randomGameContainer.classList.remove("show");
    hasSpun = false;
  });

  // Véletlenszerű játék kiválasztása
  function selectRandomGame() {
    if (!window.remainingGames || window.remainingGames.length === 0) {
      randomGameTitle.textContent = "Nincs játékadat betöltve.";
      return;
    }

    const eligibleGames = window.remainingGames.filter((game) => {
      const sectionKey = determineSectionKey(game.finishDate);
      return (
        sectionKey === "notStarted" ||
        sectionKey === "abandoned" ||
        sectionKey === "pending"
      );
    });

    if (eligibleGames.length === 0) {
      randomGameTitle.textContent = "Nincs megfelelő játék.";
      return;
    }

    let animationInterval;
    let randomIndex;

    function startAnimation() {
      randomGameCover.classList.add("spinning");
      animationInterval = setInterval(() => {
        randomIndex = Math.floor(Math.random() * eligibleGames.length);
        const randomGame = eligibleGames[randomIndex];
        randomGameCover.src = randomGame.cover;
        randomGameTitle.textContent = randomGame.title;
      }, 100);
    }

    function stopAnimation() {
      clearInterval(animationInterval);
      randomGameCover.classList.remove("spinning");

      const selectedGame = eligibleGames[randomIndex];
      randomGameCover.src = selectedGame.cover;
      randomGameTitle.textContent = selectedGame.title;
    }

    startAnimation();
    setTimeout(stopAnimation, Math.floor(Math.random() * 3000) + 2000);
  }

  function determineSectionKey(finishDate) {
    if (!finishDate) return null;
    
    const sectionMap = {
      VA: "inProgress",
      AH: "abandoned",
      P: "pending",
      OW: "openWorld",
      MMO: "mmo",
      SIM: "simulator",
      NS: "notStarted",
      IND: "indie",
    };
  
    for (const key in sectionMap) {
      if (finishDate.includes(key)) return sectionMap[key];
    }
  
    return "completed";
  }
  
});
