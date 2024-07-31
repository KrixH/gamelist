document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('cookieConsentBanner');
    var acceptButton = document.getElementById('acceptCookies');

    // Ellenőrizze, hogy elfogadták-e már a cookie-kat
    if (!localStorage.getItem('cookiesAccepted')) {
        banner.style.display = 'block';
    }

    acceptButton.addEventListener('click', function () {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.style.display = 'none';
    });
});
