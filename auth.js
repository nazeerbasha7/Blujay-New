// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyCiedANEie5u-2XQOjdsUFgdkE7s08gArY",
  authDomain: "blujay-tech.firebaseapp.com",
  projectId: "blujay-tech",
  storageBucket: "blujay-tech.firebasestorage.app",
  messagingSenderId: "586422050005",
  appId: "1:586422050005:web:737ba2502d1b283ea6165c",
  measurementId: "G-1JE665W8D0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// SET PERMANENT LOGIN PERSISTENCE
// ============================================
// User stays logged in FOREVER (even after closing browser)
// Only logs out when clicking "Logout" button
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Persistence set to LOCAL - User will stay logged in permanently');
    })
    .catch((error) => {
        console.error('❌ Error setting persistence:', error);
    });

// Global variables
let recaptchaVerifier;
let confirmationResult;

// ============================================
// INITIALIZE RECAPTCHA ON PAGE LOAD
// ============================================
window.onload = function() {
    // Initialize invisible reCAPTCHA for login page
    if (document.getElementById('recaptcha-container')) {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
                console.log('reCAPTCHA expired');
            }
        });
    }
    
    // Initialize for signup page
    if (document.getElementById('recaptcha-signup-container')) {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-signup-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('reCAPTCHA solved');
            }
        });
    }
    
    // Check if user is already logged in
    checkAuthState();
};

// ============================================
// CHECK AUTH STATE (Auto-redirect if logged in)
// ============================================
function checkAuthState() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // ✅ User is signed in
            const currentPage = window.location.pathname;
            
            console.log('✅ User authenticated:', user.email || user.phoneNumber);
            
            // If on login/signup page, redirect to dashboard
            if (currentPage.includes('login.html') || currentPage.includes('signup.html')) {
                console.log('🔄 User already logged in, redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            }
        } else {
            // ❌ User is signed out
            const currentPage = window.location.pathname;
            
            console.log('ℹ️ User not logged in');
            
            // If on protected pages, redirect to login
            if (currentPage.includes('dashboard.html') || 
                currentPage.includes('my-learning.html') || 
                currentPage.includes('course-player.html')) {
                console.log('🔄 Protected page - redirecting to login...');
                window.location.href = 'login.html';
            }
        }
    });
}

// ============================================
// PHONE LOGIN FUNCTIONALITY
// ============================================
if (document.getElementById('phone-login-form')) {
    document.getElementById('phone-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone').value.trim();
        const fullNumber = countryCode + phoneNumber;
        const submitBtn = document.getElementById('send-otp-btn');
        
        // Validation
        if (phoneNumber.length !== 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }
        
        // Show loading state
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        console.log('Sending OTP to:', fullNumber);
        
        // Send OTP
        firebase.auth().signInWithPhoneNumber(fullNumber, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                console.log('OTP sent successfully');
                
                // Prompt for OTP
                const otp = prompt('Enter the 6-digit OTP sent to ' + fullNumber);
                
                if (otp && otp.length === 6) {
                    // Verify OTP
                    submitBtn.textContent = 'Verifying...';
                    return confirmationResult.confirm(otp);
                } else {
                    throw new Error('Invalid OTP format');
                }
            })
            .then((result) => {
                const user = result.user;
                console.log('Login successful:', user);
                
                // Save user to Firestore (if not exists)
                return db.collection('users').doc(user.uid).get().then((doc) => {
                    if (!doc.exists) {
                        // New user - create profile
                        return db.collection('users').doc(user.uid).set({
                            uid: user.uid,
                            phoneNumber: user.phoneNumber,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } else {
                        // Existing user - update last login
                        return db.collection('users').doc(user.uid).update({
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }).then(() => {
                    alert('Login successful! Welcome to Blujay Technologies');
                    
                    // ✅ REDIRECT TO DASHBOARD
                    window.location.href = 'dashboard.html';
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error: ' + error.message);
                
                // Reset button
                submitBtn.textContent = 'Login';
                submitBtn.disabled = false;
                
                // Reset reCAPTCHA
                if (recaptchaVerifier) {
                    recaptchaVerifier.clear();
                    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                        'size': 'invisible'
                    });
                }
            });
    });
}

// ============================================
// GOOGLE LOGIN FUNCTIONALITY
// ============================================
if (document.getElementById('google-login-btn')) {
    document.getElementById('google-login-btn').addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                console.log('Google login successful:', user);
                
                // Save/update user in Firestore
                return db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    phoneNumber: user.phoneNumber || '',
                    profilePhoto: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            })
            .then(() => {
                alert('Login successful! Welcome to Blujay Technologies');
                
                // ✅ REDIRECT TO DASHBOARD
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            });
    });
}

// ============================================
// PHONE NUMBER FORMATTING
// ============================================
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
});

console.log('✅ Blujay Technologies - Auth System Ready with PERMANENT LOGIN!');
