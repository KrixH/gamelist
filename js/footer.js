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
        'https://r4.wallpaperflare.com/wallpaper/539/520/48/fallout-new-vegas-video-games-gun-apocalyptic-wallpaper-e211c2809d26ae7b0af8126580785932.jpg',
        'https://r4.wallpaperflare.com/wallpaper/513/292/11/gradient-abstract-hd-4k-wallpaper-e846cdf85000ec0870cc012e9822d47a.jpg',
        'https://r4.wallpaperflare.com/wallpaper/531/951/621/digital-digital-art-artwork-illustration-minimalism-hd-wallpaper-08869d3810a06c28a09cf1be487204ea.jpg',
        'https://r4.wallpaperflare.com/wallpaper/914/746/419/abstract-digital-art-minimalism-simple-background-wallpaper-68564d7870703ce8d03c017ef822649a.jpg',
        'https://r4.wallpaperflare.com/wallpaper/1023/915/631/nasa-space-suit-digital-art-space-wallpaper-d9b0d87dd1fadddb462798dfa0c1e69d.jpg',
        'https://r4.wallpaperflare.com/wallpaper/403/855/787/sword-blood-fantasy-armor-wallpaper-d98038ede1ba3dfb264758af0061862d.jpg',
        'https://r4.wallpaperflare.com/wallpaper/455/205/165/fantasy-art-digital-art-artwork-science-fiction-wallpaper-e8760df8a0b04c0880fc81de98c2546a.jpg'
    ];

    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    document.body.style.backgroundImage = `url('${randomImage}')`;
});
