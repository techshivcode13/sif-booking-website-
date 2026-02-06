// Retreat data (Initial placeholder, will be populated from DB)
let retreats = [];

async function fetchRetreats() {
    try {
        const response = await fetch('/.netlify/functions/get-retreats');
        if (response.ok) {
            retreats = await response.json();
            console.log('Retreats loaded:', retreats);
            showRetreats(); // Refresh the view
        }
    } catch (e) {
        console.warn('Failed to load dynamic retreats, using fallback if needed', e);
        // Optional: Add hardcoded fallback here if DB is down
    }
}

// View Components
function renderSplash() {
    return `
        <div class="splash-container">
            <h2 class="splash-header">SUNYATEE RETREAT</h2>
            <img src="assets/logo.png" alt="SIF Logo" class="splash-logo-img">
            <p class="splash-tagline">Your journey to inner silence begins here</p>
            <button class="btn-get-started" onclick="showRetreats()">Get Started</button>
        </div>
    `;
}

function renderRetreats() {
    return `
        <div class="retreats-container">
            <div class="header">
                <h1>Choose Your Retreat</h1>
                <p>Select from our curated meditation experiences</p>
            </div>
            <div class="retreat-grid">
                ${retreats.map((retreat, index) => `
                    <div class="retreat-card fade-in delay-${index + 1}">
                        <div class="retreat-image" style="background-image: url('${retreat.image_url || retreat.image}')">
                            <span class="retreat-badge">${retreat.capacity}</span>
                        </div>
                        <div class="retreat-content">
                            <h2 class="retreat-title">${retreat.name}</h2>
                            <p class="retreat-location">${retreat.location}</p>
                            <div class="retreat-details">
                                <div class="detail-item">
                                    <span>⏱</span>
                                    <span>${retreat.duration}</span>
                                </div>
                                ${retreat.date ? `
                                <div class="detail-item" style="margin-top: 5px;">
                                    <span class="icon-calendar">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M9 16L11 18L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                    <span>${retreat.date}</span>
                                </div>` : ''}
                            </div>
                            ${(retreat.status === 'launching_soon')
            ? '<button class="btn-book" style="opacity: 0.6; cursor: not-allowed;" disabled>Launching Soon</button>'
            : `<button class="btn-book" onclick="bookRetreat(${retreat.id})">Book This Retreat</button>`
        }
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <footer class="site-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <img src="assets/logo.png" alt="Logo">
                    <p>Sunyatee Retreat – Inner Silence, Clarity, Self-Mastery.</p>
                </div>
                <div class="footer-links">
                    <div class="link-group">
                        <h4>About</h4>
                        <a href="about.html">About Us</a>
                        <a href="contact.html">Contact Us</a>
                    </div>
                    <div class="link-group">
                        <h4>Policies</h4>
                        <a href="terms.html">Terms & Conditions</a>
                        <a href="privacy.html">Privacy Policy</a>
                    </div>
                    <div class="link-group">
                        <h4>Support</h4>
                        <a href="refund.html">Refund Policy</a>
                        <a href="shipping.html">Service Logistics</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Sunyatee International Foundation. All rights reserved.</p>
            </div>
        </footer>

        <style>
            .site-footer {
                background: #f8f6f2;
                padding: 4rem 2rem 2rem;
                margin-top: 5rem;
                border-top: 1px solid var(--border-color);
                width: 100%;
            }
            .footer-content {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 4rem;
                text-align: left;
            }
            .footer-brand img { height: 50px; margin-bottom: 1rem; }
            .footer-links {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
            }
            .link-group h4 { font-family: var(--font-serif); margin-bottom: 1.5rem; color: var(--text-primary); font-size: 1.2rem; }
            .link-group a { display: block; color: var(--text-secondary); text-decoration: none; margin-bottom: 0.75rem; font-size: 0.9rem; transition: color 0.3s; }
            .link-group a:hover { color: var(--accent-color); }
            .footer-bottom {
                max-width: 1200px;
                margin: 3rem auto 0;
                padding-top: 2rem;
                border-top: 1px solid var(--border-color);
                text-align: center;
                color: var(--text-secondary);
                font-size: 0.85rem;
            }
            @media (max-width: 768px) {
                .footer-content { grid-template-columns: 1fr; gap: 3rem; }
                .footer-links { grid-template-columns: 1fr; }
            }
        </style>
    `;
}

// Navigation
function showRetreats() {
    document.getElementById('app').innerHTML = renderRetreats();
}

function bookRetreat(id) {
    const retreat = retreats.find(r => r.id === id);
    if (retreat) {
        // Redirect to booking page for Shantivan retreat
        if (id === 1) {
            window.location.href = 'booking.html';
        } else {
            alert(`Thank you for choosing ${retreat.name}!\n\nOur team will contact you shortly to complete your booking.`);
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('app').innerHTML = renderSplash();
    fetchRetreats();
});
