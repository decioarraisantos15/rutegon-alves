// ===== STATE =====
let currentPage = 0; // 0 = cover, 1-7 = pages
const totalPages = 7;
let isPlaying = false;
let pages = [];

// ===== DOM ELEMENTS =====
const book = document.getElementById('book');
const musicBtn = document.getElementById('musicBtn');
const musicWave = document.querySelector('.music-wave');
const backgroundMusic = document.getElementById('backgroundMusic');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeBook();
    setupEventListeners();
    autoStartMusic();
});

function initializeBook() {
    // Get all book pages
    pages = Array.from(document.querySelectorAll('.book-page'));
    
    // Set music volume
    if (backgroundMusic) {
        backgroundMusic.volume = 0.3;
    }
}

// ===== AUTO START MUSIC =====
function autoStartMusic() {
    if (!backgroundMusic) return;
    
    // Tenta tocar automaticamente
    backgroundMusic.play()
        .then(() => {
            isPlaying = true;
            console.log('Música iniciada automaticamente');
        })
        .catch(error => {
            console.log('Autoplay bloqueado pelo navegador. A música tocará após interação do usuário.');
            // Fallback: tocar no primeiro clique ou toque
            const startOnInteraction = () => {
                backgroundMusic.play()
                    .then(() => {
                        isPlaying = true;
                        console.log('Música iniciada após interação');
                    })
                    .catch(e => console.log('Não foi possível tocar a música:', e));
                document.removeEventListener('click', startOnInteraction);
                document.removeEventListener('touchstart', startOnInteraction);
                document.removeEventListener('keydown', startOnInteraction);
            };
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('touchstart', startOnInteraction);
            document.addEventListener('keydown', startOnInteraction);
        });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Music control
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
    
    // Page click to flip
    pages.forEach((page, index) => {
        page.addEventListener('click', (e) => {
            // Only flip if clicking on current top page
            if (!page.classList.contains('flipped')) {
                nextPage();
            }
        });
    });
    
    // Touch gestures
    setupTouchGestures();
}

// ===== PAGE NAVIGATION =====
function nextPage() {
    if (currentPage < totalPages) {
        // Flip the current page
        pages[currentPage].classList.add('flipped');
        currentPage++;
        
        // Play page flip sound effect (optional)
        playPageSound();
        
        // Try to start music on first page turn
        if (currentPage === 1 && !isPlaying) {
            playMusic();
        }
    }
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        // Unflip the page
        pages[currentPage].classList.remove('flipped');
        
        playPageSound();
    }
}

function goToPage(pageNum) {
    if (pageNum < 0 || pageNum > totalPages) return;
    
    // Flip or unflip pages to reach target
    if (pageNum > currentPage) {
        // Flip forward
        for (let i = currentPage; i < pageNum; i++) {
            pages[i].classList.add('flipped');
        }
    } else {
        // Flip backward
        for (let i = currentPage - 1; i >= pageNum; i--) {
            pages[i].classList.remove('flipped');
        }
    }
    
    currentPage = pageNum;
}

// ===== MUSIC CONTROL =====
function toggleMusic() {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    if (!backgroundMusic) return;
    
    backgroundMusic.play()
        .then(() => {
            isPlaying = true;
            updateMusicUI();
        })
        .catch(error => {
            console.log('Unable to play music:', error);
        });
}

function pauseMusic() {
    if (!backgroundMusic) return;
    
    backgroundMusic.pause();
    isPlaying = false;
    updateMusicUI();
}

function updateMusicUI() {
    if (musicBtn) {
        if (isPlaying) {
            musicBtn.classList.add('playing');
            if (musicWave) musicWave.classList.add('active');
        } else {
            musicBtn.classList.remove('playing');
            if (musicWave) musicWave.classList.remove('active');
        }
    }
}

// ===== SOUND EFFECTS =====
function playPageSound() {
    // Create subtle page flip sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ===== KEYBOARD NAVIGATION =====
function handleKeyPress(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(event.key) {
        case 'ArrowLeft':
        case 'PageUp':
            event.preventDefault();
            previousPage();
            break;
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
            event.preventDefault();
            nextPage();
            break;
        case 'Home':
            event.preventDefault();
            goToPage(0);
            break;
        case 'End':
            event.preventDefault();
            goToPage(totalPages);
            break;
        case 'm':
        case 'M':
            event.preventDefault();
            toggleMusic();
            break;
    }
}

// ===== TOUCH GESTURES =====
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

function setupTouchGestures() {
    if (!book) return;
    
    book.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    book.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, false);
}

function handleSwipe() {
    const swipeThreshold = 50;
    const horizontalDiff = touchStartX - touchEndX;
    const verticalDiff = Math.abs(touchStartY - touchEndY);
    
    // Only process horizontal swipes
    if (verticalDiff > swipeThreshold) return;
    
    if (Math.abs(horizontalDiff) > swipeThreshold) {
        if (horizontalDiff > 0) {
            // Swipe left - next page
            nextPage();
        } else {
            // Swipe right - previous page
            previousPage();
        }
    }
}

// ===== HOVER EFFECTS =====
pages.forEach((page, index) => {
    page.addEventListener('mouseenter', () => {
        if (!page.classList.contains('flipped') && currentPage === index) {
            page.style.transform = 'rotateY(-5deg)';
        }
    });
    
    page.addEventListener('mouseleave', () => {
        if (!page.classList.contains('flipped')) {
            page.style.transform = '';
        }
    });
});

// ===== FLOATING PARTY EMOJIS ANIMATION =====
function createFloatingEmoji() {
    const particles = document.querySelector('.particles');
    if (!particles) return;
    
    const emojis = ['🎉', '🎈', '🎁', '🎂', '🎊', '✨', '🎵'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const element = document.createElement('div');
    element.innerHTML = emoji;
    element.style.position = 'absolute';
    element.style.left = Math.random() * 100 + '%';
    element.style.bottom = '-50px';
    element.style.fontSize = (Math.random() * 15 + 10) + 'px';
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    element.style.animation = `floatHeart ${Math.random() * 2 + 4}s ease-out forwards`;
    
    particles.appendChild(element);
    
    setTimeout(() => element.remove(), 6000);
}

// Add floating hearts animation
const heartStyle = document.createElement('style');
heartStyle.textContent = `
    @keyframes floatHeart {
        0% {
            bottom: -50px;
            opacity: 0;
            transform: translateX(0) rotate(0deg);
        }
        10% {
            opacity: 0.8;
        }
        90% {
            opacity: 0.8;
        }
        100% {
            bottom: 110%;
            opacity: 0;
            transform: translateX(${Math.random() > 0.5 ? '' : '-'}80px) rotate(${Math.random() * 360}deg);
        }
    }
`;
document.head.appendChild(heartStyle);

// Create party emojis periodically when book is open
setInterval(() => {
    if (currentPage > 0 && Math.random() > 0.7) {
        createFloatingEmoji();
    }
}, 3000);

// ===== AUTO-SAVE PROGRESS =====
function saveProgress() {
    try {
        localStorage.setItem('bookPage', currentPage);
    } catch (e) {
        // Silently fail
    }
}

function loadProgress() {
    try {
        const savedPage = localStorage.getItem('bookPage');
        if (savedPage !== null) {
            const pageNum = parseInt(savedPage);
            if (pageNum > 0) {
                // Auto-open to saved page after a delay
                setTimeout(() => {
                    goToPage(pageNum);
                }, 1000);
            }
        }
    } catch (e) {
        // Silently fail
    }
}

// Save on page change
window.addEventListener('beforeunload', saveProgress);

// Load progress (optional - uncomment to enable)
// loadProgress();

// ===== 3D BOOK TILT EFFECT =====
if (book && window.innerWidth > 768) {
    book.addEventListener('mousemove', (e) => {
        const rect = book.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        book.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    book.addEventListener('mouseleave', () => {
        book.style.transform = '';
    });
}

// ===== EASTER EGG - QUICK FLIP =====
let clickCount = 0;
let clickTimer = null;

if (book) {
    book.addEventListener('dblclick', () => {
        // Quick flip through all pages
        let i = 0;
        const flipInterval = setInterval(() => {
            if (i < totalPages) {
                nextPage();
                i++;
            } else {
                clearInterval(flipInterval);
            }
        }, 300);
    });
}

// ===== PRELOAD IMAGES =====
function preloadImages() {
    const images = document.querySelectorAll('.page-content img');
    images.forEach(img => {
        const tempImg = new Image();
        tempImg.src = img.src;
    });
}

window.addEventListener('load', preloadImages);

// ===== DEBUG INFO =====
console.log('🎂 Birthday Book - Loaded Successfully');
console.log(`📄 Total Spreads: ${totalPages}`);
console.log('💡 Controls: Arrow Keys, Page Up/Down, Space, M (music)');
console.log('🎉 Easter Egg: Double-click to quick flip!');
