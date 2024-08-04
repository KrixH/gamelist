document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("current-year").textContent = new Date().getFullYear();
});

//Back to top button funckiós
document.addEventListener("DOMContentLoaded", function() {
    const backToTopButton = document.querySelector(".back-to-top");

    window.addEventListener("scroll", function() {
        if (window.scrollY > 100) { // Az érték módosítható a görgetési pozícióhoz
            backToTopButton.classList.add("show");
        } else {
            backToTopButton.classList.remove("show");
        }
    });
});
