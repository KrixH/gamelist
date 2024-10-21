document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("cookieConsentBanner");
  const acceptButton = document.getElementById("acceptCookies");
  const manageButton = document.getElementById("manageCookies");
  const preferencesModal = document.getElementById("cookiePreferencesModal");
  const savePreferencesButton = document.getElementById("savePreferences");
  const backToTopButton = document.querySelector(".back-to-top");

  // Cookie figyelmeztetés kezelése
  function handleCookies() {
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");

    if (!cookiesAccepted) {
      banner.style.display = "block";
    }

    acceptButton.addEventListener("click", function () {
      localStorage.setItem("cookiesAccepted", "true");
      banner.style.display = "none";
    });

    manageButton.addEventListener("click", function () {
      banner.style.display = "none";
      preferencesModal.style.display = "block";
    });

    savePreferencesButton.addEventListener("click", function () {
      const necessaryCookies =
        document.getElementById("necessaryCookies").checked;

      if (necessaryCookies) {
        localStorage.setItem("necessaryCookies", "true");
      }

      preferencesModal.style.display = "none";
    });
  }

  // "Vissza a tetejére" gomb funkció
  function handleBackToTop() {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    });

    backToTopButton.addEventListener("click", (e) => {
      e.preventDefault();
      backToTopButton.classList.add("scroll-animate");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setTimeout(() => {
        backToTopButton.classList.remove("scroll-animate");
      }, 1000);
    });
  }

  // Véletlenszerű háttérkép beállítása
  function setRandomBackgroundImage() {
    const backgroundImages = [
      "https://i.imgur.com/zblkdvw.png",
      "https://i.imgur.com/Jak9CNe.png",
      "https://i.imgur.com/EOieKhP.jpeg",
      "https://i.imgur.com/Mf5KGcY.jpeg",
      "https://i.imgur.com/vccw0IO.jpeg",
    ];

    const randomImage =
      backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    document.body.style.backgroundImage = `url('${randomImage}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  }

  // Az aktuális év beállítása
  function updateCurrentYear() {
    document.getElementById("current-year").textContent =
      new Date().getFullYear();
  }

  // Minden funkció meghívása
  handleCookies();
  handleBackToTop();
  setRandomBackgroundImage();
  updateCurrentYear();
});
