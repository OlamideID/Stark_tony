gsap.registerPlugin(ScrollTrigger);

const totalFrames = 169;

const canvas1 = document.getElementById('canvas-1');
const ctx1 = canvas1.getContext('2d');
const canvas2 = document.getElementById('canvas-2');
const ctx2 = canvas2.getContext('2d');

const images1 = [];
const images2 = [];

let loadedCount = 0;
const totalToLoad = totalFrames * 2;

function resize() {
    canvas1.width = canvas2.width = window.innerWidth;
    canvas1.height = canvas2.height = window.innerHeight;
}

function preload() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const loadFramesEl = document.getElementById('load-frames');

    for (let i = 1; i <= totalFrames; i++) {
        const frame = i.toString().padStart(4, '0');

        const img1 = new Image();
        img1.src = `./frames/frame_${frame}.jpg`;
        img1.onload = img1.onerror = handleLoad;
        images1.push(img1);

        const img2 = new Image();
        img2.src = `./frames2/frame_${frame}.jpg`;
        img2.onload = img2.onerror = handleLoad;
        images2.push(img2);
    }

    function handleLoad() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalToLoad) * 100);
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;
        if (loadFramesEl) loadFramesEl.textContent = `FRAMES: ${loadedCount} / ${totalToLoad}`;

        if (loadedCount >= totalToLoad) {
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('fade-out');
                initScrollAnimations();
            }, 400);
        }
    }
}

function drawImageCover(ctx, img, canvas) {
    if (!img || !img.complete || !img.naturalWidth) return;
    const hRatio = canvas.width / img.naturalWidth;
    const vRatio = canvas.height / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);
    const cx = (canvas.width - img.naturalWidth * ratio) / 2;
    const cy = (canvas.height - img.naturalHeight * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,
        cx, cy, img.naturalWidth * ratio, img.naturalHeight * ratio);
}

function updateQuotes(containerId, currentFrame) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.quote-item').forEach(item => {
        const start = parseInt(item.getAttribute('data-frame-start'));
        const end = parseInt(item.getAttribute('data-frame-end'));
        item.classList.toggle('active', currentFrame >= start && currentFrame <= end);
    });
}

function updateFrameCounter(numElId, frameIndex) {
    const el = document.getElementById(numElId);
    if (el) el.textContent = String(frameIndex + 1).padStart(3, '0');
}

function updateSectionProgress(fillId, percentId, progress) {
    const fill = document.getElementById(fillId);
    const pct = document.getElementById(percentId);
    const p = Math.round(progress * 100);
    if (fill) fill.style.width = `${p}%`;
    if (pct) pct.textContent = `${p}%`;
}

let stateB_active = false;
const overlayRight = document.getElementById('overlay-right');
const stateA = document.getElementById('state-a');
const stateB = document.getElementById('state-b');

function updateSection2State(frameIndex, section2InView) {
    if (!overlayRight || !stateA || !stateB) return;
    overlayRight.classList.toggle('visible', section2InView);

    if (frameIndex >= 89 && !stateB_active) {
        stateB_active = true;
        stateA.classList.add('hidden');
        stateB.classList.add('visible');
    } else if (frameIndex < 89 && stateB_active) {
        stateB_active = false;
        stateA.classList.remove('hidden');
        stateB.classList.remove('visible');
    }
}

function initScrollAnimations() {
    const sections = document.querySelectorAll('.scroll-section');

    sections.forEach((section, index) => {
        const proxy = { frame: 0, progress: 0 };

        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate(self) {
                const progress = self.progress;
                const frameIndex = Math.min(
                    Math.floor(progress * (totalFrames - 1)),
                    totalFrames - 1
                );

                if (index === 0) {
                    const inView = progress > 0 && progress < 1;
                    const ql = document.getElementById('quotes-left-1');
                    if (ql) ql.classList.toggle('visible', inView);

                    if (images1[frameIndex]) drawImageCover(ctx1, images1[frameIndex], canvas1);
                    updateFrameCounter('fc-num-1', frameIndex);
                    updateQuotes('quotes-left-1', frameIndex);
                    updateSectionProgress('sp-fill-1', 'sp-percent-1', progress);

                } else {
                    const inView = progress > 0 && progress < 1;
                    const ql = document.getElementById('quotes-left-2');
                    if (ql) ql.classList.toggle('visible', inView);

                    if (images2[frameIndex]) drawImageCover(ctx2, images2[frameIndex], canvas2);
                    updateFrameCounter('fc-num-2', frameIndex);
                    updateQuotes('quotes-left-2', frameIndex);
                    updateSectionProgress('sp-fill-2', 'sp-percent-2', progress);
                    updateSection2State(frameIndex, inView);
                }
            }
        });
    });
}

window.addEventListener('resize', () => {
    resize();
    ScrollTrigger.refresh();
});

resize();
preload();