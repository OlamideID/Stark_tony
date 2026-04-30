const totalFrames = 169;

const canvas1 = document.getElementById('canvas-1');
const ctx1 = canvas1.getContext('2d');
const canvas2 = document.getElementById('canvas-2');
const ctx2 = canvas2.getContext('2d');

const images1 = [];
const images2 = [];

let loadedCount = 0;
const totalToLoad = totalFrames * 2; // Loading for 2 sections

function resize() {
    canvas1.width = canvas2.width = window.innerWidth;
    canvas1.height = canvas2.height = window.innerHeight;
}

function preload() {
    const progressFill = document.getElementById('progress-fill');

    for (let i = 1; i <= totalFrames; i++) {
        const frame = i.toString().padStart(4, '0');

        // Frame set 1
        const img1 = new Image();
        img1.src = `./frames/frame_${frame}.jpg`;
        img1.onload = () => handleLoad();
        img1.onerror = () => handleLoad(); // Don't get stuck on missing files
        images1.push(img1);

        // Frame set 2
        const img2 = new Image();
        img2.src = `./frames2/frame_${frame}.jpg`;
        img2.onload = () => handleLoad();
        img2.onerror = () => handleLoad();
        images2.push(img2);
    }

    function handleLoad() {
        loadedCount++;
        const percent = (loadedCount / totalToLoad) * 100;
        progressFill.style.width = `${percent}%`;

        if (loadedCount >= totalToLoad) {
            document.getElementById('loading-screen').classList.add('fade-out');
            handleScroll(); // Initial draw
        }
    }
}

function drawImageCover(ctx, img, canvas) {
    if (!img.complete) return;
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

function handleScroll() {
    const sections = document.querySelectorAll('.scroll-section');

    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;

        let progress = -rect.top / (sectionHeight - window.innerHeight);
        progress = Math.max(0, Math.min(1, progress));

        const frameIndex = Math.floor(progress * (totalFrames - 1));
        const overlay = section.querySelector('.ui-overlay');

        if (overlay) {
            const scale = 1 + (progress * 0.1);
            const opacity = progress > 0.9 ? (1 - progress) * 10 : 1;
            overlay.style.transform = `scale(${scale})`;
            overlay.style.opacity = opacity;
        }

        if (index === 0) {
            if (images1[frameIndex]) drawImageCover(ctx1, images1[frameIndex], canvas1);
        } else {
            if (images2[frameIndex]) drawImageCover(ctx2, images2[frameIndex], canvas2);
        }
    });
}

window.addEventListener('resize', resize);
window.addEventListener('scroll', () => requestAnimationFrame(handleScroll));

resize();
preload();