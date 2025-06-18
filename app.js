import { db, getDoc, doc } from './firebase.js';

async function readData(docId) {
    const id = docId || '12414';
    const ref = doc(db, 'kiyosa', id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        appData.docExists = true;
        const data = snap.data();
        appData.totalStamps = data.total;
        appData.collectedStamps = data.current;
    } else {
        console.log('No such document!');
        appData.docExists = false;
        appData.totalStamps = 1;
        appData.collectedStamps = 0;
    }
}

// Application data
const appData = {
    companyName: "Coffee Corner",
    totalStamps: 5,
    collectedStamps: 4,
    rewardText: "Get your 10th stamp for a FREE coffee!",
    stamps: [],
    queryValue: "",
    docExists: true
};

// Build the stamp array based on total and collected values
function generateStamps() {
    appData.stamps = [];
    for (let i = 1; i <= appData.totalStamps; i++) {
        appData.stamps.push({
            id: i,
            collected: i <= appData.collectedStamps,
            error: !appData.docExists
        });
    }
}

// DOM elements
const stampsContainer = document.getElementById('stamps-container');
const collectedCountElement = document.getElementById('collected-count');
const totalCountElement = document.getElementById('total-count');
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
    let stampClass = 'stamp ';
    if (stamp.error) {
        stampClass += 'stamp--error';
    } else {
        stampClass += stamp.collected ? 'stamp--collected' : 'stamp--uncollected';
    }
    stampElement.className = stampClass;
    stampElement.setAttribute('data-stamp-id', stamp.id);

    if (stamp.collected) {
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.innerHTML = '✓';
        stampElement.appendChild(checkmark);
    } else if (stamp.error) {
        const cross = document.createElement('span');
        cross.className = 'crossmark';
        cross.innerHTML = '✕';
        stampElement.appendChild(cross);
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
function updateProgressInfo() {
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

    await readData(appData.queryValue);
    generateStamps();
    renderStamps();
    updateProgressInfo();

    // Add animations after a short delay to ensure DOM is ready
    setTimeout(addStampAnimations, 100);
}

// Run the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
