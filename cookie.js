document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('cookieConsentBanner');
    var acceptButton = document.getElementById('acceptCookies');

    // Check if cookies have already been accepted
    if (!localStorage.getItem('cookiesAccepted')) {
        banner.style.display = 'block';
    }

    acceptButton.addEventListener('click', function () {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.style.display = 'none';
    });
});
