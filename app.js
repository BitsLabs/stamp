import { db, getDoc, doc } from './firebase.js';

async function readData(id) {
    if (!id) {
        return false;
    }
    const ref = doc(db, 'S9El7UJM8awVc1gpr6A3NRiOr30gpv3cl5xKoZLgucZ7TO9S3xb9T4oLKPfatyobuEABDPP4NzQU2VS4Zls0ojLaB45lKxPTkDPL37dDO5swMfOOhzIM1BB8ewTjdce4', id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const data = snap.data();
        appData.totalStamps = data.total;
        appData.collectedStamps = data.current;
        return true;
    }
    console.log('No such document!');
    return false;
}

// Application data
const appData = {
    companyName: "Stamp Card",
    totalStamps: 0,
    collectedStamps: 0,
    rewardText: "Get your 10th stamp for a FREE coffee!",
    stamps: [],
    queryValue: ""
};

// Translation strings
const translations = {
    en: {
        loyaltyCard: 'Loyalty Card',
        progressPrefix: 'of',
        progressSuffix: 'stamps',
        invalidCode: 'Invalid code',
        serviceText: 'A service by',
        showQrCode: 'Show QR Code'
    },
    de: {
        loyaltyCard: 'Treuekarte',
        progressPrefix: 'von',
        progressSuffix: 'Stempel',
        invalidCode: 'Ungültiger Code',
        serviceText: 'Ein Service von',
        showQrCode: 'QR-Code anzeigen'
    }
};

let currentLang = 'en';

function detectLanguage() {
    const supported = Object.keys(translations);
    const browserLangs = navigator.languages || [navigator.language || 'en'];
    for (const l of browserLangs) {
        const short = l.slice(0, 2);
        if (supported.includes(short)) {
            return short;
        }
    }
    return 'en';
}

// Build the stamp array based on total and collected values
function generateStamps() {
    appData.stamps = []; 
    for (let i = 1; i <= appData.totalStamps; i++) {
        appData.stamps.push({
            id: i,
            collected: i <= appData.collectedStamps
        });
    }
}

// DOM elements
const stampsContainer = document.getElementById('stamps-container');
const collectedCountElement = document.getElementById('collected-count');
const totalCountElement = document.getElementById('total-count');
const progressTextElement = document.getElementById('progress-text');
const errorMessageElement = document.getElementById('error-message');
const queryValueElement = document.getElementById('query-value');
const companyLogoElement = document.getElementById('company-logo');
const progressPrefixElement = document.getElementById('progress-prefix');
const progressSuffixElement = document.getElementById('progress-suffix');
const serviceTextElement = document.getElementById('service-text');
const qrBtn = document.getElementById('show-qr');
const showQrLabelElement = document.getElementById('show-qr-label');
const qrOverlay = document.getElementById('qr-overlay');
const qrClose = document.getElementById('qr-close');
const qrCanvas = document.getElementById('qr-canvas');
const qrParamElement = document.getElementById('qr-param-text');

qrBtn.addEventListener('click', () => {
    QRCode.toCanvas(qrCanvas, window.location.href, { width: 240, margin: 2 });
    if (qrParamElement) {
        qrParamElement.textContent = appData.queryValue;
    }
    qrOverlay.classList.remove('hidden');
});

qrClose.addEventListener('click', () => {
    qrOverlay.classList.add('hidden');
});

function applyTranslations() {
    const t = translations[currentLang] || translations.en;
    document.documentElement.lang = currentLang;
    document.title = `${appData.companyName} - ${t.loyaltyCard}`;
    if (progressPrefixElement) progressPrefixElement.textContent = t.progressPrefix;
    if (progressSuffixElement) progressSuffixElement.textContent = t.progressSuffix;
    if (serviceTextElement) serviceTextElement.textContent = t.serviceText;
    if (showQrLabelElement) showQrLabelElement.textContent = t.showQrCode;
}

// Read the part of the URL after the '?'
function readQueryValue() {
    return window.location.search
        ? window.location.search.substring(1)
        : '';
}

// Load header logo from Firestore
async function loadHeaderLogo() {
    if (!companyLogoElement) return;
    try {
        const logoRef = doc(db, 'kiyosa', 'headerimage');
        const logoSnap = await getDoc(logoRef);
        if (logoSnap.exists()) {
            const data = logoSnap.data();
            const matcher = window.matchMedia('(prefers-color-scheme: dark)');
            const setLogo = () => {
                const prefersDark = matcher.matches;
                companyLogoElement.src = prefersDark && data.url_dark ? data.url_dark : data.url;
                companyLogoElement.alt = `${appData.companyName} logo`;
            };
            setLogo();
            if (typeof matcher.addEventListener === 'function') {
                matcher.addEventListener('change', setLogo);
            } else if (typeof matcher.addListener === 'function') {
                matcher.addListener(setLogo);
            }
        }
    } catch (e) {
        console.error('Failed to load header logo', e);
    }
}

// Function to create a stamp element
function createStampElement(stamp) {
    const stampElement = document.createElement('div');
    if (stamp.error) {
        stampElement.className = 'stamp stamp--error';
        const mark = document.createElement('span');
        mark.className = 'error-mark';
        mark.textContent = '✗';
        stampElement.appendChild(mark);
        return stampElement;
    }
    stampElement.className = `stamp ${stamp.collected ? 'stamp--collected' : 'stamp--uncollected'}`;
    stampElement.setAttribute('data-stamp-id', stamp.id);
    
    if (stamp.collected) {
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.innerHTML = '✓';
        stampElement.appendChild(checkmark);
    }
    
    return stampElement;
}

// Function to render all stamps
function renderStamps() {
    // Clear existing stamps
    stampsContainer.innerHTML = '';
    
    // Create and append each stamp
    appData.stamps.forEach(stamp => {
        const stampElement = createStampElement(stamp);
        stampsContainer.appendChild(stampElement);
    });
}

// Function to update progress information
function updateProgressInfo(hasError) {
    if (hasError) {
        if (progressTextElement) progressTextElement.classList.add('hidden');
        if (errorMessageElement) {
            errorMessageElement.textContent = translations[currentLang].invalidCode;
            errorMessageElement.classList.remove('hidden');
        }
        return;
    }

    if (progressTextElement) progressTextElement.classList.remove('hidden');
    if (errorMessageElement) errorMessageElement.classList.add('hidden');
    collectedCountElement.textContent = appData.collectedStamps;
    totalCountElement.textContent = appData.totalStamps;
}

// Function to add subtle animation to stamps
function addStampAnimations() {
    const stamps = document.querySelectorAll('.stamp');
    stamps.forEach((stamp, index) => {
        // Add a slight delay to each stamp animation for a staggered effect
        stamp.style.animationDelay = `${index * 0.1}s`;
        stamp.style.opacity = '0';
        stamp.style.transform = 'scale(0.5)';
        
        // Animate in
        setTimeout(() => {
            stamp.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            stamp.style.opacity = '1';
            stamp.style.transform = 'scale(1)';
        }, index * 100);
    });
}

// Initialize the application
async function initApp() {
    currentLang = detectLanguage();
    applyTranslations();
    await loadHeaderLogo();
    appData.queryValue = readQueryValue();
    if (queryValueElement) {
        queryValueElement.textContent = appData.queryValue;
    }

    const hasData = await readData(appData.queryValue);
    if (!hasData) {
        appData.totalStamps = 1;
        appData.collectedStamps = 0;
        appData.stamps = [{ id: 1, error: true }];
        stampsContainer.classList.add('single-stamp');
    } else {
        generateStamps();
        stampsContainer.classList.remove('single-stamp');
    }

    renderStamps();
    updateProgressInfo(!hasData);

    // Add animations after a short delay to ensure DOM is ready
    setTimeout(addStampAnimations, 100);
}

// Run the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
