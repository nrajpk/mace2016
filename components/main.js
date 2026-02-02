/**
 * DUMMY main.js
 * Use this to test the UI/Animations without Firebase
 */

// 1. Configuration & State
let currentProgress = 0;
let mockOtp = "1234";
let timer;

// 2. Loading Animation Logic
function updateLoader() {
    const messages = ["Dusting yearbooks...", "Polishing trophies...", "Gathering alumni...", "Loading memories...", "Readying the campus..."];
    const textEl = document.getElementById('loading-text');
    const barEl = document.getElementById('progress-bar');

    if (currentProgress < 100) {
        currentProgress += (Math.random() * 1.5) + 0.5;
        if (currentProgress > 100) currentProgress = 100;
        barEl.style.width = `${currentProgress}%`;
        
        const msgIndex = Math.floor(currentProgress / 21);
        if (messages[msgIndex]) textEl.textContent = messages[msgIndex];
        
        setTimeout(updateLoader, 100);
    } else {
        textEl.textContent = "Welcome Home.";
        // Hide loader, show the "Name the Event" button
        document.getElementById('loader-content').style.display = 'none';
        document.getElementById('main-action-btn').style.display = 'block';
    }
}

// 3. Modal Controls
const toggleModal = (show) => {
    const modal = document.getElementById('event-modal');
    modal.classList.toggle('hidden', !show);
    if(show) backToDetails();
};

const backToDetails = () => {
    document.getElementById('step-details').classList.remove('hidden');
    document.getElementById('step-otp').classList.add('hidden');
    document.getElementById('success-msg').classList.add('hidden');
};

const proceedToVerification = (e) => {
    e.preventDefault();
    console.log("Details submitted. Moving to OTP...");
    document.getElementById('step-details').classList.add('hidden');
    document.getElementById('step-otp').classList.remove('hidden');
    startTimer();
};

const startTimer = () => {
    let sec = 59;
    const timerEl = document.getElementById('otp-timer');
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timerEl.textContent = `Resend code in 00:${sec < 10 ? '0'+sec : sec}`;
        if (sec <= 0) { 
            clearInterval(timer); 
            timerEl.textContent = "Didn't get code? Resend via WhatsApp"; 
        }
        sec--;
    }, 1000);
};

// 4. Mock Submit (Simulates Database Save)
const verifyAndSubmit = () => {
    const otp = Array.from(document.querySelectorAll('.otp-input')).map(i => i.value).join('');
    
    if (otp !== mockOtp) { 
        alert("Incorrect code. Use '1234'."); 
        return; 
    }

    const verifyBtn = document.getElementById('verify-btn');
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Saving...";

    // Simulate a 1.5 second network delay
    setTimeout(() => {
        const name = document.getElementById('user-name').value;
        document.getElementById('display-name').textContent = name.split(' ')[0];
        
        document.getElementById('step-otp').classList.add('hidden');
        document.getElementById('success-msg').classList.remove('hidden');
        console.log("Success! Data (not) saved to Firebase.");
    }, 1500);
};

// 5. Event Listeners
document.getElementById('main-action-btn').addEventListener('click', () => toggleModal(true));
document.getElementById('modal-overlay').addEventListener('click', () => toggleModal(false));
document.getElementById('modal-close-x').addEventListener('click', () => toggleModal(false));
document.getElementById('details-form').addEventListener('submit', proceedToVerification);
document.getElementById('back-btn').addEventListener('click', backToDetails);
document.getElementById('verify-btn').addEventListener('click', verifyAndSubmit);
document.getElementById('close-success-btn').addEventListener('click', () => toggleModal(false));

// OTP Auto-focus logic
document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length >= 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });
});

// Start the app
window.onload = updateLoader;
