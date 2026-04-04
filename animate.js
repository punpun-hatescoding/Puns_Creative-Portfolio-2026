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
// --- 5. ANIMATION CHANNEL PLAYLIST LOGIC ---
// Function to update Player AND Info Box
function updatePlayer(vimeoID, imageSrc, title, desc, tools, btn, extraImages) {
    
    // 1. Update Link & Image
    const link = document.getElementById('main-video-link');
    if (link) link.href = `https://vimeo.com/${vimeoID}`;

    const img = document.getElementById('main-preview-image');
    if (img) img.src = imageSrc;

    // 2. Update Info Box Text
    document.getElementById('video-title').innerText = title;
    document.getElementById('video-desc').innerText = desc;
    document.getElementById('video-tools').innerText = tools;

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