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

    // Az aktuális év beállítása a láblécben
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // "Vissza a tetejére" gomb funkció
    const backToTopButton = document.querySelector('.back-to-top');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) { // Az érték módosítható a görgetési pozícióhoz
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // Véletlenszerű háttérkép beállítása
    const backgroundImages = [
        'https://i.imgur.com/zblkdvw.png',
        'https://i.imgur.com/Jak9CNe.png',
        'https://r4.wallpaperflare.com/wallpaper/217/807/693/render-video-games-minecraft-wallpaper-89c0a84d910abddbd6b7f81fd0f1169d.jpg',
        'https://r4.wallpaperflare.com/wallpaper/167/480/43/doom-eternal-doom-slayers-club-video-game-art-video-games-hd-wallpaper-780cde507caf64fc3cbe031137214d74.jpg',
        'https://r4.wallpaperflare.com/wallpaper/836/364/865/police-gun-debris-swat-wallpaper-6940f81d913aadabb647284fb071f6ad.jpg',
        'https://r4.wallpaperflare.com/wallpaper/539/520/48/fallout-new-vegas-video-games-gun-apocalyptic-wallpaper-e211c2809d26ae7b0af8126580785932.jpg'
    ];

    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    document.body.style.backgroundImage = `url('${randomImage}')`;
});
