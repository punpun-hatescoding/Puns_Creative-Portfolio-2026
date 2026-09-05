// --- 1. DROPDOWN MENU with portal ---
(function(){
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (!dropdownBtn || !dropdownMenu) return;

    // store original parent to restore later
    const originalParent = dropdownMenu.parentNode;
    const originalNext = dropdownMenu.nextSibling;

    let portalOpen = false;

    function positionMenu(menu, button) {
        const rect = button.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        
        const top = rect.bottom + scrollY + 10; 
        const menuWidth = menu.offsetWidth || 160; 
        const screenWidth = window.innerWidth;
        let left = rect.left + scrollX;

        if (left + menuWidth > screenWidth) {
            left = (rect.right + scrollX) - menuWidth;
        }
        if (left < 10) { 
            left = 10; 
        }

        menu.style.position = 'absolute';
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
        menu.style.zIndex = '99999';
    }

    function openPortal() {
        if (portalOpen) return;
        document.body.appendChild(dropdownMenu);
        dropdownMenu.classList.add('open');
        dropdownMenu.classList.add('portal-open');
        positionMenu(dropdownMenu, dropdownBtn);
        portalOpen = true;
        window.addEventListener('scroll', onWindowChange, {passive:true});
        window.addEventListener('resize', onWindowChange);
    }

    function closePortal() {
        if (!portalOpen) return;
        dropdownMenu.classList.remove('open');
        dropdownMenu.classList.remove('portal-open');
        dropdownMenu.style.position = '';
        dropdownMenu.style.top = '';
        dropdownMenu.style.left = '';
        dropdownMenu.style.minWidth = '';
        dropdownMenu.style.zIndex = '';
        
        if (originalNext && originalNext.parentNode === originalParent) {
            originalParent.insertBefore(dropdownMenu, originalNext);
        } else {
            originalParent.appendChild(dropdownMenu);
        }
        portalOpen = false;
        window.removeEventListener('scroll', onWindowChange);
        window.removeEventListener('resize', onWindowChange);
    }

    function onWindowChange(){
        if (!portalOpen) return;
        positionMenu(dropdownMenu, dropdownBtn);
    }

    dropdownBtn.addEventListener('click', function(e){
        e.stopPropagation();
        if (portalOpen) closePortal(); else openPortal();
    });

    dropdownMenu.addEventListener('click', function(e){
        if (e.target.tagName === 'A') {
            closePortal();
        }
    });

    document.addEventListener('click', function(e){
        const isInsideBtn = !!e.target.closest('.dropdown-btn');
        const isInsideMenu = !!e.target.closest('.dropdown-menu');
        if (!isInsideBtn && !isInsideMenu) closePortal();
    });

    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') closePortal();
    });
})();

// --- 2. NPC & SPARKLES ---
const npc = document.getElementById('npc-follower');
let isMouseMoveThrottle = false; 

document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (npc) {
            npc.style.left = (x + 25) + 'px';
            npc.style.top = (y + 25) + 'px';
    }

    if (!isMouseMoveThrottle) {
        createSparkle(x, y);
        isMouseMoveThrottle = true;
        setTimeout(() => isMouseMoveThrottle = false, 50);
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    document.body.appendChild(sparkle);

    sparkle.style.left = (x + 50) + 'px';
    sparkle.style.top = (y + 50) + 'px';
    const randomX = (Math.random() - 0.5) * 60; 
    sparkle.style.setProperty('--random-x', randomX + 'px');

    setTimeout(() => {
        sparkle.remove();
    }, 1000); 
}

// --- 3. MAIN LOGIC (Popup, Draggable, Tabs) ---
// We combine these into ONE event listener to avoid conflicts
document.addEventListener('DOMContentLoaded', () => {
    
    // --- A. DRAGGABLE CARD LOGIC ---
    const card = document.querySelector('.character-card');
    const header = document.querySelector('.window-header');
    const container = document.querySelector('.about-section');
    
    if (card && header && container) {
        let isDragging = false;
        let shiftX, shiftY;

        header.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            isDragging = true;
            const rect = card.getBoundingClientRect();
            shiftX = e.clientX - rect.left;
            shiftY = e.clientY - rect.top;
            header.style.cursor = 'grabbing';
            e.preventDefault(); 
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const containerRect = container.getBoundingClientRect();
            let newLeft = e.clientX - containerRect.left - shiftX;
            let newTop = e.clientY - containerRect.top - shiftY;
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
            card.style.transform = 'none'; 
            card.style.margin = '0';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });
    }

    // --- B. RETRO POPUP LOGIC ---
    const closeBtn = document.querySelector('.close-btn'); 
    const popup = document.getElementById('retro-popup');
    const cancelBtn = document.querySelector('.cancel-btn'); 
    const xPopup = document.getElementById('x'); // <-- Updated as per your request

    function openPopup() {
        if (popup) popup.classList.add('active');
    }

    function closePopup() {
        if (popup) popup.classList.remove('active');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPopup();
        });
    }

    if (cancelBtn) cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
    });
    
    if (xPopup) xPopup.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
    });

    // Close if clicking outside
    document.addEventListener('click', (e) => {
        if (popup && popup.classList.contains('active')) {
            if (!closeBtn.contains(e.target) && !popup.contains(e.target)) {
                closePopup();
            }
        }
    });


    // --- C. TAB LOGIC ---
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 1. Remove 'active' from ALL tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                // 2. Add 'active' to the ONE you clicked
                tab.classList.add('active');

                // 3. Find the matching content ID (e.g., "skills") and show it
                const targetId = tab.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                if (targetContent) {
                    targetContent.classList.add('active');
                    console.log(`Switched to tab: ${targetId}`); // Debugging check
                } else {
                    console.error(`Could not find content for id: ${targetId}`);
                }

                // 4. Tabs vary a lot in height (Experience is much longer than
                // Bio/Skills/Hobbies). If the card was ever dragged, it has an
                // inline top/left pinning it in place - clear that so it goes
                // back to being positioned by CSS for its new height, instead
                // of staying pinned somewhere that clips the new content.
                const card = document.querySelector('.character-card');
                if (card) {
                    card.style.top = '';
                    card.style.left = '';
                    card.style.transform = '';
                }

                // 5. Whatever scroll position you were at for the old (often
                // shorter) tab doesn't make sense for the new one - e.g. if
                // you were scrolled partway down Bio and switch to the much
                // taller Experience tab, that same scroll position now lands
                // you mid-card instead of at the top, which looks like the
                // top got cut off. Scroll the card's top back into view.
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
});

// --- 4. DRAGGING STATE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.character-card');
    const header = document.querySelector('.window-header');

    if (card && header) {
        // 1. Mouse Down: Start "Dragging" state
        header.addEventListener('mousedown', () => {
            card.classList.add('is-dragging');
        });

        // 2. Mouse Up: Stop "Dragging" state
        // We listen on 'window' in case you drag cursor outside the box
        window.addEventListener('mouseup', () => {
            card.classList.remove('is-dragging');
        });
    }
});


// --- D. LEVEL SELECT HOVER LOGIC ---
    const worldCards = document.querySelectorAll('.world-card');
    const briefTitle = document.getElementById('brief-title');
    const briefDesc = document.getElementById('brief-desc');
    const briefLoot = document.getElementById('brief-loot');

    if (worldCards.length > 0) {
        worldCards.forEach(card => {
            // When mouse enters a card
            card.addEventListener('mouseenter', () => {
                // Get data from the HTML attributes
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                const loot = card.getAttribute('data-loot');

                // Update the text box
                briefTitle.innerText = title;
                briefDesc.innerText = desc;
                briefLoot.innerText = loot;
                
                // Optional: Change color slightly to show activity
                briefTitle.style.color = '#fff';
            });

            // When mouse leaves (reset to default)
            card.addEventListener('mouseleave', () => {
                briefTitle.innerText = "SELECT A WORLD...";
                briefDesc.innerText = "Hover over a map to view details.";
                briefLoot.innerText = "---";
                briefTitle.style.color = 'var(--yellowgreen)'; // Reset color
            });
        });
    }

// --- TOGGLE MAXIMIZE (With Icon Swap) ---
// --- TOGGLE MAXIMIZE (With 3 Icon Options) ---
function toggleMaximize(btn) {
    const win = btn.closest('.project-window') || btn.closest('.character-card');
    if (!win) return;

    const iconClassic = `
    <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;display:block;">
        <path d="M4 8h10v10H4z m12 0h-2V6h6v10h-2z M20 6V4H14v2z"/>
    </svg>`;

    const restoreIcon = iconClassic; // <--- Change this to iconBoxInBox or iconClassic
    
    const maximizeIcon = "◻"; 

    if (win.classList.contains('is-maximized')) {
        // === RESTORE DOWN ===
        win.classList.remove('is-maximized');

        // Restore saved position
        win.style.top = win.dataset.prevTop || '';
        win.style.left = win.dataset.prevLeft || '';
        win.style.transform = win.dataset.prevTransform || '';
        
        // Clean up memory
        delete win.dataset.prevTop;
        delete win.dataset.prevLeft;
        delete win.dataset.prevTransform;

        // Change icon back to empty square
        btn.innerHTML = maximizeIcon;

    } else {
        // === MAXIMIZE ===
        // Save current position
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTransform = win.style.transform;

        win.classList.add('is-maximized');
        win.style.transform = 'none';

        // Change icon to your selected restore icon
        btn.innerHTML = restoreIcon;
    }
}

// --- E. SEND EMAIL LOGIC ---
const sendBtn = document.getElementById('send-btn');
if (sendBtn) {
    sendBtn.addEventListener('click', () => {
            // 1. Change cursor to hourglass
            document.body.style.cursor = 'wait';
            
            // 2. Change Text
            const originalText = sendBtn.innerHTML;
            sendBtn.innerHTML = `<span>Sending...</span>`;
            
            // 3. Fake delay
            setTimeout(() => {
                alert("✨ Message delivered via Magic Cat Mail! 🐱 📨");
                
                // Reset
                sendBtn.innerHTML = originalText;
                document.body.style.cursor = 'default';
                
                // Clear inputs
                document.querySelector('.retro-input').value = '';
                document.querySelector('.retro-textarea').value = '';
                
            }, 1500);
        });
    }
// Renders the "Design Docs" row shared by webdev.html and animation.html.
// docs is an array of {label, href} objects; an empty/missing array hides
// the whole row instead of leaving it dangling with nothing to show.
// Full-page renders of each project's design docs (process/storyboard/script
// PDFs, rasterized page-by-page) -- appended to the curated preview strip so
// visitors can flip through the whole document, not just a couple highlights.
const glassessayDocPages = [
    'previews/docs/glassessay-process-p01.jpg',
    'previews/docs/glassessay-process-p02.jpg',
    'previews/docs/glassessay-process-p03.jpg',
    'previews/docs/glassessay-process-p04.jpg',
    'previews/docs/glassessay-process-p05.jpg',
    'previews/docs/glassessay-process-p06.jpg',
    'previews/docs/glassessay-process-p07.jpg',
    'previews/docs/glassessay-process-p08.jpg',
    'previews/docs/glassessay-process-p09.jpg',
    'previews/docs/glassessay-process-p10.jpg',
    'previews/docs/glassessay-process-p11.jpg',
    'previews/docs/glassessay-process-p12.jpg',
    'previews/docs/glassessay-process-p13.jpg',
    'previews/docs/glassessay-process-p14.jpg',
    'previews/docs/glassessay-process-p15.jpg',
    'previews/docs/glassessay-process-p16.jpg',
    'previews/docs/glassessay-process-p17.jpg',
    'previews/docs/glassessay-process-p18.jpg',
    'previews/docs/glassessay-mockup1-p01.jpg',
    'previews/docs/glassessay-mockup2-p01.jpg',
    'previews/docs/glassessay-mockup3-p01.jpg'
];
const silentwarDocPages = [
    'previews/docs/silentwar-process-p01.jpg',
    'previews/docs/silentwar-process-p02.jpg',
    'previews/docs/silentwar-process-p03.jpg',
    'previews/docs/silentwar-process-p04.jpg',
    'previews/docs/silentwar-process-p05.jpg',
    'previews/docs/silentwar-process-p06.jpg',
    'previews/docs/silentwar-process-p07.jpg',
    'previews/docs/silentwar-process-p08.jpg',
    'previews/docs/silentwar-process-p09.jpg',
    'previews/docs/silentwar-process-p10.jpg',
    'previews/docs/silentwar-process-p11.jpg',
    'previews/docs/silentwar-process-p12.jpg',
    'previews/docs/silentwar-process-p13.jpg',
    'previews/docs/silentwar-process-p14.jpg',
    'previews/docs/silentwar-process-p15.jpg',
    'previews/docs/silentwar-process-p16.jpg',
    'previews/docs/silentwar-process-p17.jpg',
    'previews/docs/silentwar-process-p18.jpg',
    'previews/docs/silentwar-process-p19.jpg',
    'previews/docs/silentwar-process-p20.jpg',
    'previews/docs/silentwar-process-p21.jpg',
    'previews/docs/silentwar-process-p22.jpg',
    'previews/docs/silentwar-process-p23.jpg',
    'previews/docs/silentwar-process-p24.jpg',
    'previews/docs/silentwar-process-p25.jpg',
    'previews/docs/silentwar-process-p26.jpg',
    'previews/docs/silentwar-process-p27.jpg',
    'previews/docs/silentwar-process-p28.jpg',
    'previews/docs/silentwar-process-p29.jpg',
    'previews/docs/silentwar-process-p30.jpg'
];
const bromanceDocPages = [
    'previews/docs/bromance-process-p02.jpg',
    'previews/docs/bromance-process-p03.jpg',
    'previews/docs/bromance-process-p04.jpg',
    'previews/docs/bromance-process-p05.jpg',
    'previews/docs/bromance-process-p06.jpg',
    'previews/docs/bromance-process-p07.jpg',
    'previews/docs/bromance-process-p08.jpg',
    'previews/docs/bromance-process-p09.jpg',
    'previews/docs/bromance-process-p10.jpg',
    'previews/docs/bromance-process-p11.jpg',
    'previews/docs/bromance-process-p12.jpg',
    'previews/docs/bromance-process-p13.jpg',
    'previews/docs/bromance-process-p14.jpg',
    'previews/docs/bromance-process-p15.jpg',
    'previews/docs/bromance-process-p16.jpg',
    'previews/docs/bromance-process-p17.jpg',
    'previews/docs/bromance-process-p18.jpg',
    'previews/docs/bromance-process-p19.jpg',
    'previews/docs/bromance-process-p20.jpg',
    'previews/docs/bromance-process-p21.jpg',
    'previews/docs/bromance-process-p22.jpg',
    'previews/docs/bromance-process-p23.jpg',
    'previews/docs/bromance-process-p24.jpg',
    'previews/docs/bromance-process-p25.jpg',
    'previews/docs/bromance-process-p26.jpg',
    'previews/docs/bromance-process-p27.jpg',
    'previews/docs/bromance-process-p28.jpg',
    'previews/docs/bromance-process-p29.jpg',
    'previews/docs/bromance-process-p30.jpg',
    'previews/docs/bromance-process-p31.jpg',
    'previews/docs/bromance-process-p32.jpg',
    'previews/docs/bromance-process-p33.jpg',
    'previews/docs/bromance-process-p34.jpg',
    'previews/docs/bromance-process-p35.jpg',
    'previews/docs/bromance-process-p36.jpg',
    'previews/docs/bromance-process-p37.jpg',
    'previews/docs/bromance-process-p38.jpg',
    'previews/docs/bromance-process-p39.jpg',
    'previews/docs/bromance-process-p40.jpg',
    'previews/docs/bromance-process-p41.jpg',
    'previews/docs/bromance-process-p42.jpg',
    'previews/docs/bromance-process-p43.jpg',
    'previews/docs/bromance-process-p44.jpg',
    'previews/docs/bromance-process-p45.jpg',
    'previews/docs/bromance-process-p46.jpg',
    'previews/docs/bromance-process-p47.jpg',
    'previews/docs/bromance-process-p48.jpg',
    'previews/docs/bromance-process-p49.jpg',
    'previews/docs/bromance-process-p50.jpg',
    'previews/docs/bromance-process-p51.jpg',
    'previews/docs/bromance-process-p52.jpg',
    'previews/docs/bromance-process-p53.jpg',
    'previews/docs/bromance-process-p54.jpg',
    'previews/docs/bromance-process-p55.jpg'
];
const caviarDocPages = [
    'previews/docs/caviar-script-p01.jpg',
    'previews/docs/caviar-script-p02.jpg',
    'previews/docs/caviar-storyboard-p01.jpg',
    'previews/docs/caviar-storyboard-p02.jpg',
    'previews/docs/caviar-storyboard-p03.jpg',
    'previews/docs/caviar-storyboard-p04.jpg',
    'previews/docs/caviar-storyboard-p05.jpg',
    'previews/docs/caviar-storyboard-p06.jpg',
    'previews/docs/caviar-storyboard-p07.jpg',
    'previews/docs/caviar-storyboard-p08.jpg',
    'previews/docs/caviar-storyboard-p09.jpg',
    'previews/docs/caviar-storyboard-p10.jpg',
    'previews/docs/caviar-storyboard-p11.jpg',
    'previews/docs/caviar-storyboard-p12.jpg',
    'previews/docs/caviar-storyboard-p13.jpg',
    'previews/docs/caviar-storyboard-p14.jpg',
    'previews/docs/caviar-storyboard-p15.jpg',
    'previews/docs/caviar-storyboard-p16.jpg',
    'previews/docs/caviar-storyboard-p17.jpg',
    'previews/docs/caviar-storyboard-p18.jpg',
    'previews/docs/caviar-storyboard-p19.jpg',
    'previews/docs/caviar-storyboard-p20.jpg',
    'previews/docs/caviar-storyboard-p21.jpg',
    'previews/docs/caviar-storyboard-p22.jpg',
    'previews/docs/caviar-storyboard-p23.jpg',
    'previews/docs/caviar-storyboard-p24.jpg',
    'previews/docs/caviar-conceptual-p01.jpg',
    'previews/docs/caviar-conceptual-p02.jpg',
    'previews/docs/caviar-conceptual-p03.jpg',
    'previews/docs/caviar-conceptual-p04.jpg',
    'previews/docs/caviar-conceptual-p05.jpg',
    'previews/docs/caviar-conceptual-p06.jpg',
    'previews/docs/caviar-conceptual-p07.jpg',
    'previews/docs/caviar-conceptual-p08.jpg',
    'previews/docs/caviar-conceptual-p09.jpg',
    'previews/docs/caviar-conceptual-p10.jpg',
    'previews/docs/caviar-conceptual-p11.jpg',
    'previews/docs/caviar-conceptual-p12.jpg',
    'previews/docs/caviar-conceptual-p13.jpg',
    'previews/docs/caviar-conceptual-p14.jpg',
    'previews/docs/caviar-conceptual-p15.jpg',
    'previews/docs/caviar-conceptual-p16.jpg',
    'previews/docs/caviar-conceptual-p17.jpg',
    'previews/docs/caviar-conceptual-p18.jpg',
    'previews/docs/caviar-conceptual-p19.jpg',
    'previews/docs/caviar-conceptual-p20.jpg',
    'previews/docs/caviar-conceptual-p21.jpg',
    'previews/docs/caviar-conceptual-p22.jpg',
    'previews/docs/caviar-conceptual-p23.jpg',
    'previews/docs/caviar-conceptual-p24.jpg',
    'previews/docs/caviar-conceptual-p25.jpg',
    'previews/docs/caviar-conceptual-p26.jpg',
    'previews/docs/caviar-conceptual-p27.jpg',
    'previews/docs/caviar-conceptual-p28.jpg',
    'previews/docs/caviar-conceptual-p29.jpg',
    'previews/docs/caviar-conceptual-p30.jpg',
    'previews/docs/caviar-conceptual-p31.jpg',
    'previews/docs/caviar-conceptual-p32.jpg',
    'previews/docs/caviar-conceptual-p33.jpg',
    'previews/docs/caviar-conceptual-p34.jpg',
    'previews/docs/caviar-conceptual-p35.jpg',
    'previews/docs/caviar-conceptual-p36.jpg',
    'previews/docs/caviar-conceptual-p37.jpg',
    'previews/docs/caviar-conceptual-p38.jpg',
    'previews/docs/caviar-conceptual-p39.jpg',
    'previews/docs/caviar-conceptual-p40.jpg',
    'previews/docs/caviar-conceptual-p41.jpg',
    'previews/docs/caviar-conceptual-p42.jpg',
    'previews/docs/caviar-conceptual-p43.jpg',
    'previews/docs/caviar-conceptual-p44.jpg',
    'previews/docs/caviar-conceptual-p45.jpg',
    'previews/docs/caviar-conceptual-p46.jpg',
    'previews/docs/caviar-conceptual-p47.jpg',
    'previews/docs/caviar-conceptual-p48.jpg',
    'previews/docs/caviar-conceptual-p49.jpg',
    'previews/docs/caviar-conceptual-p50.jpg',
    'previews/docs/caviar-conceptual-p51.jpg',
    'previews/docs/caviar-conceptual-p52.jpg',
    'previews/docs/caviar-conceptual-p53.jpg',
    'previews/docs/caviar-conceptual-p54.jpg'
];


function renderDocLinks(docs) {
    const row = document.getElementById('video-docs-row');
    const container = document.getElementById('video-docs');
    if (!container) return;
    if (!docs || docs.length === 0) {
        if (row) row.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    if (row) row.style.display = '';
    container.innerHTML = docs
        .map(doc => `<a href="${doc.href}" target="_blank">📄 ${doc.label}</a>`)
        .join('');
}

// --- 5. ANIMATION CHANNEL PLAYLIST LOGIC ---
// Function to update Player AND Info Box
function updatePlayer(videoID, imageSrc, title, desc, tools, btn, extraImages, docs) {

    // 1. Update Link & Image
    // videoID is normally a bare Vimeo ID, but a full URL (e.g. a YouTube
    // link) is also accepted and used as-is instead of being wrapped in
    // the vimeo.com/ prefix.
    const isFullUrl = /^https?:\/\//.test(videoID);
    const link = document.getElementById('main-video-link');
    if (link) link.href = isFullUrl ? videoID : `https://vimeo.com/${videoID}`;

    const playText = document.querySelector('#window-cinema .play-text');
    if (playText) {
        playText.textContent = /youtube\.com|youtu\.be/.test(videoID) ? 'Watch On YouTube' : 'Watch On Vimeo';
    }

    const img = document.getElementById('main-preview-image');
    if (img) img.src = imageSrc;

    // 2. Update Info Box Text
    document.getElementById('video-title').innerText = title;
    document.getElementById('video-desc').innerText = desc;
    document.getElementById('video-tools').innerText = tools;
    renderDocLinks(docs);

    // 3. Highlight Active Button
    const allTapes = document.querySelectorAll('.tape-btn');
    allTapes.forEach(tape => tape.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const container = document.getElementById('screenshot-container');
    if (container && extraImages) {
        container.innerHTML = ''; // Clear old images
        
        // Loop through the new images and create div/img tags
        extraImages.forEach(imgSrc => {
            const div = document.createElement('div');
            div.className = 'strip-item';
            div.innerHTML = `
                <img src="${imgSrc}" alt="Preview">
                <span class="strip-label">Process</span>
            `;
            container.appendChild(div);
        });
    }
}
// --- 5b. WEB DESIGN PROJECT SELECTOR LOGIC ---
// Similar to updatePlayer(), but for webdev.html's project selector, where
// each entry behaves differently: some link out to a live experience, some
// show a demo video, and one (still in progress) has no link to give at all.
function updateWebProject(mediaSrc, isVideo, mainLink, mainLinkLabel, title, desc, tools, tryLink, btn, extraImages, docs) {

    // 1. Show either the still image or the looping video preview
    const img = document.getElementById('main-preview-image');
    const vid = document.getElementById('main-preview-video');
    if (isVideo) {
        if (img) img.style.display = 'none';
        if (vid) {
            vid.src = mediaSrc;
            vid.style.display = 'block';
            vid.play().catch(() => {}); // ignore autoplay rejection
        }
    } else {
        if (vid) {
            vid.pause();
            vid.removeAttribute('src');
            vid.style.display = 'none';
        }
        if (img) {
            img.style.display = 'block';
            img.src = mediaSrc;
        }
    }

    // 2. Update the main link - some projects (e.g. ORGAN(IC), still in
    // progress) don't have anywhere to send visitors yet, so the preview
    // isn't clickable and the play overlay is hidden instead of pointing
    // nowhere.
    const link = document.getElementById('main-video-link');
    const playOverlay = document.querySelector('#window-cinema .play-overlay');
    const playText = document.querySelector('#window-cinema .play-text');
    if (link) {
        if (mainLink) {
            link.href = mainLink;
            link.style.pointerEvents = 'auto';
            if (playOverlay) playOverlay.style.display = '';
            if (playText) playText.textContent = mainLinkLabel;
        } else {
            link.removeAttribute('href');
            link.style.pointerEvents = 'none';
            if (playOverlay) playOverlay.style.display = 'none';
        }
    }

    // 3. Update Info Box Text
    document.getElementById('video-title').innerText = title;
    document.getElementById('video-desc').innerText = desc;
    document.getElementById('video-tools').innerText = tools;
    renderDocLinks(docs);

    // 4. Show/hide the "Try It Yourself" button depending on whether
    // there's a live link to send people to
    const actionRow = document.querySelector('.action-row');
    const tryLinkEl = document.getElementById('try-btn-link');
    if (tryLink) {
        if (actionRow) actionRow.style.display = '';
        if (tryLinkEl) tryLinkEl.href = tryLink;
    } else {
        if (actionRow) actionRow.style.display = 'none';
    }

    // 5. Highlight Active Button
    const allTapes = document.querySelectorAll('#window-cinema .tape-btn');
    allTapes.forEach(tape => tape.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // 6. Swap the extra preview screenshots
    const container = document.getElementById('webdev-strip');
    if (container) {
        container.innerHTML = '';
        (extraImages || []).forEach(imgSrc => {
            const div = document.createElement('div');
            div.className = 'strip-item';
            div.innerHTML = `
                <img src="${imgSrc}" alt="Preview">
                <span class="strip-label"></span>
            `;
            container.appendChild(div);
        });
    }
}

// --- 5c. DEEP-LINK A PROJECT VIA ?project=slug ---
// Lets other pages (e.g. works.html's Featured Work cards) link straight
// into a specific tape on webdev.html/animation.html instead of always
// landing on whichever one is active by default. Each tape-btn carries a
// matching data-project attribute; if no match is found (wrong slug, or a
// page with no tape-btns at all) this quietly does nothing.
document.addEventListener('DOMContentLoaded', () => {
    const project = new URLSearchParams(window.location.search).get('project');
    if (!project) return;
    const btn = document.querySelector(`.tape-btn[data-project="${project}"]`);
    if (btn) btn.click();
});

// Function to handle Mobile Arrow Navigation
function navigatePlaylist(direction) {
    // 1. Get all the tape buttons
    const tapes = document.querySelectorAll('.tape-btn');
    if (tapes.length === 0) return;

    // 2. Find the index of the CURRENTLY active button
    let currentIndex = 0;
    tapes.forEach((tape, index) => {
        if (tape.classList.contains('active')) {
            currentIndex = index;
        }
    });

    // 3. Calculate the NEW index
    // direction is -1 (Prev) or +1 (Next)
    let newIndex = currentIndex + direction;

    // 4. Handle Looping (Infinite Scroll)
    // If we go below 0, jump to the last tape
    if (newIndex < 0) {
        newIndex = tapes.length - 1;
    } 
    // If we go past the end, jump back to the first tape
    else if (newIndex >= tapes.length) {
        newIndex = 0;
    }

    // 5. Simulate a click on the new button
    // This triggers your existing updatePlayer() function automatically!
    tapes[newIndex].click();
}

/* --- SWIPEABLE PREVIEW-STRIP LIGHTBOX (webdev.html / animation.html) --- */
// The preview strips (#webdev-strip, #screenshot-container) can hold dozens
// of design-doc pages. Clicking any thumbnail opens a full-size viewer that
// swipes/arrows/arrow-keys through every image currently in that strip --
// built once and reused, and wired via event delegation so it works for
// both the static HTML thumbnails and ones added later by updatePlayer()/
// updateWebProject().
let stripLightboxEl = null;
let stripLightboxImages = [];
let stripLightboxIndex = 0;

function getStripLightbox() {
    if (stripLightboxEl) return stripLightboxEl;

    const overlay = document.createElement('div');
    overlay.id = 'strip-lightbox';
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <div class="lightbox-content strip-lightbox-content">
            <button class="strip-lightbox-arrow strip-lightbox-prev" aria-label="Previous page">‹</button>
            <img class="strip-lightbox-img" src="" alt="Design doc page">
            <button class="strip-lightbox-arrow strip-lightbox-next" aria-label="Next page">›</button>
            <span class="strip-lightbox-counter"></span>
            <span class="close-lightbox">×</span>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('close-lightbox')) {
            overlay.classList.remove('active');
        }
    });
    overlay.querySelector('.strip-lightbox-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        stepStripLightbox(-1);
    });
    overlay.querySelector('.strip-lightbox-next').addEventListener('click', (e) => {
        e.stopPropagation();
        stepStripLightbox(1);
    });

    // Swipe support (touch) and click-drag (mouse) on the image itself
    let dragStartX = null;
    const img = overlay.querySelector('.strip-lightbox-img');
    img.addEventListener('touchstart', (e) => { dragStartX = e.touches[0].clientX; }, { passive: true });
    img.addEventListener('touchend', (e) => {
        if (dragStartX === null) return;
        const dx = e.changedTouches[0].clientX - dragStartX;
        if (Math.abs(dx) > 40) stepStripLightbox(dx > 0 ? -1 : 1);
        dragStartX = null;
    });

    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') overlay.classList.remove('active');
        if (e.key === 'ArrowLeft') stepStripLightbox(-1);
        if (e.key === 'ArrowRight') stepStripLightbox(1);
    });

    stripLightboxEl = overlay;
    return overlay;
}

function renderStripLightbox() {
    const overlay = getStripLightbox();
    overlay.querySelector('.strip-lightbox-img').src = stripLightboxImages[stripLightboxIndex];
    overlay.querySelector('.strip-lightbox-counter').textContent =
        `${stripLightboxIndex + 1} / ${stripLightboxImages.length}`;
}

function stepStripLightbox(direction) {
    if (stripLightboxImages.length === 0) return;
    stripLightboxIndex = (stripLightboxIndex + direction + stripLightboxImages.length) % stripLightboxImages.length;
    renderStripLightbox();
}

// Design-doc page thumbnails are rendered small (previews/docs/) so the
// strip stays light to load; swap in the full-resolution render
// (previews/docs-full/) for the lightbox so it isn't a blurry, blown-up
// thumbnail. Other strip images (curated project screenshots) have no
// such pair and are just shown as-is.
function fullResSrc(img) {
    // el.src resolves to an absolute URL, so match/replace on the raw
    // attribute (a site-relative path like "previews/docs/foo.jpg") instead.
    const raw = img.getAttribute('src') || '';
    return raw.includes('previews/docs/') ? raw.replace('previews/docs/', 'previews/docs-full/') : img.src;
}

function openStripLightbox(clickedImg) {
    const strip = clickedImg.closest('.preview-strip');
    if (!strip) return;
    const imgs = Array.from(strip.querySelectorAll('.strip-item img'));
    stripLightboxImages = imgs.map(fullResSrc);
    stripLightboxIndex = imgs.indexOf(clickedImg);
    renderStripLightbox();
    getStripLightbox().classList.add('active');
}

document.addEventListener('click', (e) => {
    const img = e.target.closest('.preview-strip .strip-item img');
    if (img) openStripLightbox(img);
});

/* --- MINIMAL LIGHTBOX LOGIC --- */

function openArt(element) {
    const lightbox = document.getElementById('clean-lightbox');
    const img = element.querySelector('img');
    const title = element.querySelector('h3').innerText;
    
    // Set Content
    document.getElementById('lb-img').src = img.src;
    document.getElementById('lb-title').innerText = title;
    document.getElementById('lb-desc').innerText = img.getAttribute('data-desc');
    
    // Show
    lightbox.classList.add('active');
}

function closeArt(e) {
    // Close if clicking the background OR the X button
    if (e.target.id === 'clean-lightbox' || e.target.classList.contains('close-lightbox')) {
        document.getElementById('clean-lightbox').classList.remove('active');
    }
}

// --- GALLERY FILTER (Tattoos page) ---
function filterGallery(category, btn) {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.gallery-grid .art-item').forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        item.style.display = match ? '' : 'none';
    });
}

/* --- SCROLL ANIMATION TRIGGER --- */
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Create the observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the element is visible
            if (entry.isIntersecting) {
                // Add the class that triggers the CSS animation
                entry.target.classList.add('visible');
                // Stop observing it (so it doesn't fade out again)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the item is visible
    });

    // 2. Tell the observer to watch all art items
    const artItems = document.querySelectorAll('.art-item');
    artItems.forEach(item => {
        observer.observe(item);
    });
});