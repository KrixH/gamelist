document.addEventListener('DOMContentLoaded', function() {
    // Cookie figyelmeztetés kezelése
    var banner = document.getElementById('cookieConsentBanner');
    var acceptButton = document.getElementById('acceptCookies');

    // Ellenőrizze, hogy elfogadták-e már a cookie-kat
    if (!localStorage.getItem('cookiesAccepted')) {
        banner.style.display = 'block';
    }

    acceptButton.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.style.display = 'none';
    });

    // "Vissza a tetejére" gomb funkció
    const backToTopButton = document.querySelector('.back-to-top');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) { 
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // Véletlenszerű háttérkép beállítása
    const backgroundImages = [
        'https://i.imgur.com/zblkdvw.png',
        'https://i.imgur.com/Jak9CNe.png',
        'https://i.imgur.com/EOieKhP.jpeg',
        'https://i.imgur.com/fq1gwFt.png',
        'https://i.imgur.com/Mf5KGcY.jpeg',
        'https://i.imgur.com/vccw0IO.jpeg'
    ];

    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    document.body.style.backgroundImage = `url('${randomImage}')`;
    document.body.style.backgroundSize = 'cover'; // Ensures the background covers the entire page
    document.body.style.backgroundPosition = 'center'; // Centers the background image
    document.body.style.backgroundRepeat = 'no-repeat'; // Prevents the background from repeating

    // Az aktuális év beállítása
    document.getElementById("current-year").textContent = new Date().getFullYear();
});
