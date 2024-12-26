document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("cookieConsentBanner");
  const acceptButton = document.getElementById("acceptCookies");
  const manageButton = document.getElementById("manageCookies");
  const preferencesModal = document.getElementById("cookiePreferencesModal");
  const savePreferencesButton = document.getElementById("savePreferences");
  const backToTopButton = document.querySelector(".back-to-top");

  // Ellenőrzés: csak akkor hajtja végre, ha minden szükséges elem elérhető
  if (
    banner &&
    acceptButton &&
    manageButton &&
    preferencesModal &&
    savePreferencesButton &&
    backToTopButton
  ) {
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
        const necessaryCookiesCheckbox =
          document.getElementById("necessaryCookies");
        if (necessaryCookiesCheckbox && necessaryCookiesCheckbox.checked) {
          localStorage.setItem("necessaryCookies", "true");
        }
        preferencesModal.style.display = "none";
      });
    }

    // "Vissza a tetejére" gomb funkció és ünnepi témák
    function handleBackToTop() {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      let isSpecialEvent = false;

      if ((month === 10 && day === 31) || (month === 11 && day === 1)) {
        backToTopButton.classList.add("halloween-theme");
        isSpecialEvent = true;
      }

      if (month === 12 && day >= 24 && day <= 27) {
        backToTopButton.classList.add("christmas-theme");
        isSpecialEvent = true;
      }

      if ((month === 12 && day === 31) || (month === 1 && day === 1)) {
        backToTopButton.classList.add("new-year-theme");
        isSpecialEvent = true;
      }

      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          backToTopButton.style.opacity = "1";
          backToTopButton.style.visibility = "visible";
        } else {
          backToTopButton.style.opacity = "0";
          backToTopButton.style.visibility = "hidden";
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
          if (
            isSpecialEvent &&
            backToTopButton.classList.contains("new-year-theme")
          ) {
            launchConfetti();
          }
        }, 1500);
      });
    }

    // Konfetti robbanás
    function launchConfetti() {
      const confettiContainer = document.createElement("div");
      confettiContainer.style.position = "fixed";
      confettiContainer.style.top = "0";
      confettiContainer.style.left = "0";
      confettiContainer.style.width = "100%";
      confettiContainer.style.height = "100%";
      confettiContainer.style.pointerEvents = "none";
      document.body.appendChild(confettiContainer);

      const confettiCount = 250;
      const year = new Date().getFullYear().toString();

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.position = "absolute";
        confetti.style.width = `${Math.random() * 8 + 6}px`;
        confetti.style.height = `${Math.random() * 8 + 6}px`;
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.top = `0vh`;
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animation = `fall ${
          Math.random() * 3 + 4
        }s ease-out forwards`;
        confettiContainer.appendChild(confetti);
      }

      for (let i = 0; i < year.length; i++) {
        const numberConfetti = document.createElement("div");
        numberConfetti.classList.add("confetti-number");
        numberConfetti.textContent = year[i];
        numberConfetti.style.position = "absolute";
        numberConfetti.style.fontSize = "64px";
        numberConfetti.style.fontWeight = "bold";
        numberConfetti.style.color = getRandomColor();
        numberConfetti.style.top = `0vh`;
        numberConfetti.style.left = `${(i + 1) * 20}vw`;
        numberConfetti.style.animation = `fallNumbers ${
          Math.random() * 3 + 4
        }s ease-out forwards`;
        confettiContainer.appendChild(numberConfetti);
      }

      setTimeout(() => {
        document.body.removeChild(confettiContainer);
      }, 8000);
    }

    function getRandomColor() {
      const colors = [
        "#ff0",
        "#0f0",
        "#00f",
        "#f00",
        "#0ff",
        "#f0f",
        "#ff0",
        "#2B3856",
        "#E2A76F",
        "#660000",
        "#DA1884",
        "#FEFCFF",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

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
      const img = new Image();
      img.src = randomImage;
      img.referrerPolicy = "noreferrer";

      img.onload = function () {
        document.body.style.backgroundImage = `url('${randomImage}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
      };
    }

    function updateCurrentYear() {
      const currentYearElement = document.getElementById("current-year");
      if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear().toString();
      }
    }

    handleCookies();
    handleBackToTop();
    setRandomBackgroundImage();
    updateCurrentYear();
  } else {
    console.warn("Nem találhatóak a szükséges DOM elemek.");
  }
});

// Konfetti esés animáció CSS
const style = document.createElement("style");
style.innerHTML = `
  @keyframes fall {
    0% { transform: translateY(0) rotate(0); }
    100% { transform: translateY(100vh) rotate(360deg); }
  }

  @keyframes fallNumbers {
    0% { transform: translateY(0); }
    100% { transform: translateY(100vh); }
  }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: red;
  }

  .confetti-number {
    font-size: 40px;
    font-weight: bold;
  }
`;
document.head.appendChild(style);
