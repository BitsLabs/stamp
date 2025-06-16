// Application data
const appData = {
    "companyName": "Coffee Corner",
    "totalStamps": 10,
    "collectedStamps": 6,
    "rewardText": "Get your 10th stamp for a FREE coffee!",
    "stamps": [
        {"id": 1, "collected": true},
        {"id": 2, "collected": true},
        {"id": 3, "collected": true},
        {"id": 4, "collected": true},
        {"id": 5, "collected": true},
        {"id": 6, "collected": true},
        {"id": 7, "collected": false},
        {"id": 8, "collected": false},
        {"id": 9, "collected": false},
        {"id": 10, "collected": false}
    ]
};

// DOM elements
const stampsContainer = document.getElementById('stamps-container');
const collectedCountElement = document.getElementById('collected-count');
const totalCountElement = document.getElementById('total-count');

// Function to create a stamp element
function createStampElement(stamp) {
    const stampElement = document.createElement('div');
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
function initApp() {
    renderStamps();
    updateProgressInfo();
    
    // Add animations after a short delay to ensure DOM is ready
    setTimeout(addStampAnimations, 100);
}

// Run the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);