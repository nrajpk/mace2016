import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Firebase Config
// Note: Ensure __firebase_config is defined globally or replace with your config object
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'reunion-naming-contest';

let currentUser = null;
let mockOtp = "1234"; 
let currentProgress = 0;
let timer;

// Initialization
const initAuth = async () => {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
    } else {
        await signInAnonymously(auth);
    }
};

onAuthStateChanged(auth, (user) => { currentUser = user; });
initAuth();

// Loading Logic
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
        document.getElementById('loader-content').style.display = 'none';
        document.getElementById('main-action-btn').style.display = 'block';
    }
}

// Modal Functions
const toggleModal = (show) => {
    document.getElementById('event-modal').classList.toggle('hidden', !show);
    if(show) backToDetails();
};

const backToDetails = () => {
    document.getElementById('step-details').classList.remove('hidden');
    document.getElementById('step-otp').classList.add('hidden');
    document.getElementById('success-msg').classList.add('hidden');
};

const proceedToVerification = (e) => {
    e.preventDefault();
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

const verifyAndSubmit = async () => {
    if (!currentUser) { alert("Connecting to server..."); return; }

    const otp = Array.from(document.querySelectorAll('.otp-input')).map(i => i.value).join('');
    if (otp !== mockOtp) { alert("Incorrect code. Use '1234'."); return; }

    const verifyBtn = document.getElementById('verify-btn');
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Saving...";

    const payload = {
        userName: document.getElementById('user-name').value,
        batch: document.getElementById('user-batch').value,
        contact: document.getElementById('user-contact').value,
        suggestedName: document.getElementById('event-input').value,
        verified: true,
        submittedBy: currentUser.uid,
        timestamp: serverTimestamp()
    };

    try {
        const suggestionsCol = collection(db, 'artifacts', appId, 'public', 'data', 'suggestions');
        await addDoc(suggestionsCol, payload);
        document.getElementById('display-name').textContent = payload.userName.split(' ')[0];
        document.getElementById('step-otp').classList.add('hidden');
        document.getElementById('success-msg').classList.remove('hidden');
    } catch (err) {
        console.error(err);
        alert("Failed to save. Try again.");
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Verify & Submit";
    }
};

// Event Listeners
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

window.onload = updateLoader;
