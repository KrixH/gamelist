        // Töm a háttérképek URL-jeivel
        const backgroundImages = [
            'https://i.imgur.com/zblkdvw.png',
            'https://r4.wallpaperflare.com/wallpaper/217/807/693/render-video-games-minecraft-wallpaper-89c0a84d910abddbd6b7f81fd0f1169d.jpg',
            'https://r4.wallpaperflare.com/wallpaper/167/480/43/doom-eternal-doom-slayers-club-video-game-art-video-games-hd-wallpaper-780cde507caf64fc3cbe031137214d74.jpg',
            'https://r4.wallpaperflare.com/wallpaper/836/364/865/police-gun-debris-swat-wallpaper-6940f81d913aadabb647284fb071f6ad.jpg',
            'https://r4.wallpaperflare.com/wallpaper/539/520/48/fallout-new-vegas-video-games-gun-apocalyptic-wallpaper-e211c2809d26ae7b0af8126580785932.jpg'
        ];

        // Véletlenszerű kép kiválasztása
        const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

        // Háttérkép beállítása
        document.body.style.backgroundImage = `url('${randomImage}')`;