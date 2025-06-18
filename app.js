import { db, getDoc, doc } from './firebase.js';

async function readData(id) {
    if (!id) {
        return false;
    }
    const ref = doc(db, 'kiyosa', id);
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
    companyName: "Coffee Corner",
    totalStamps: 0,
    collectedStamps: 0,
    rewardText: "Get your 10th stamp for a FREE coffee!",
    stamps: [],
    queryValue: ""
};

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

// Read the part of the URL after the '?'
function readQueryValue() {
    return window.location.search
        ? window.location.search.substring(1)
        : '';
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
            errorMessageElement.textContent = 'Invalid code';
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
