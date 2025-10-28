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
// ✅ ADMIN EMAIL LIST (CASE-INSENSITIVE)
// ============================================
const ADMIN_EMAILS = [
    'cheruku.harikrishna@gmail.com',
    'nazeerbasha7711@gmail.com',
    'admin@blujay.com'
    // Add more admin emails here (lowercase)
];

// ============================================
// ✅ CHECK IF USER IS ADMIN (IMPROVED)
// ============================================
function checkIfAdmin(user) {
    if (!user || !user.email) return false;
    const email = user.email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(email);
    console.log(`🔍 Admin check for ${email}: ${isAdmin}`);
    return isAdmin;
}

// ============================================
// ✅ SMART REDIRECT BASED ON ROLE & CURRENT PAGE
// ============================================
function handleAuthRedirect(user) {
    if (!user) return;
    
    const currentPath = window.location.pathname;
    const isAdmin = checkIfAdmin(user);
    
    console.log('📍 Current path:', currentPath);
    console.log('👤 User email:', user.email);
    console.log('🎯 Is Admin:', isAdmin);
    
    // On login/signup pages
    if (currentPath.includes('login.html') || currentPath.includes('signup.html') || currentPath === '/' || currentPath.includes('index.html')) {
        if (isAdmin) {
            console.log('✅ Redirecting admin to admin dashboard...');
            window.location.href = 'admin/admin-dashboard.html';
        } else {
            console.log('✅ Redirecting student to dashboard...');
            window.location.href = 'dashboard.html';
        }
        return;
    }
    
    // Admin trying to access student pages
    if (isAdmin && (currentPath.includes('dashboard.html') && !currentPath.includes('admin'))) {
        console.log('⚠️ Admin on student page, redirecting to admin dashboard...');
        window.location.href = 'admin/admin-dashboard.html';
        return;
    }
    
    // Student trying to access admin pages
    if (!isAdmin && currentPath.includes('admin/')) {
        console.log('⚠️ Student trying to access admin page, redirecting to student dashboard...');
        window.location.href = '../dashboard.html';
        return;
    }
}

// ============================================
// ✅ CHECK AUTH STATE (IMPROVED)
// ============================================
function checkAuthState() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ User authenticated:', user.email || user.phoneNumber);
            handleAuthRedirect(user);
        } else {
            console.log('ℹ️ User not logged in');
            const currentPath = window.location.pathname;
            
            // Redirect to login if on protected pages
            if (currentPath.includes('dashboard.html') || 
                currentPath.includes('my-learning.html') || 
                currentPath.includes('course-player.html') ||
                currentPath.includes('admin/')) {
                console.log('🔄 Protected page - redirecting to login...');
                const redirectTo = currentPath.includes('admin/') ? '../login.html' : 'login.html';
                window.location.href = redirectTo;
            }
        }
    });
}

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
                
                // Save user to Firestore
                return db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    phoneNumber: user.phoneNumber,
                    role: 'student',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            })
            .then(() => {
                alert('Login successful! Welcome to Blujay Technologies');
                // Phone users are always students
                window.location.href = 'dashboard.html';
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
// GOOGLE LOGIN FUNCTIONALITY (IMPROVED)
// ============================================
if (document.getElementById('google-login-btn')) {
    document.getElementById('google-login-btn').addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                console.log('Google login successful:', user);
                
                const isAdmin = checkIfAdmin(user);
                
                // Save/update user in Firestore
                return db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    phoneNumber: user.phoneNumber || '',
                    profilePhoto: user.photoURL,
                    role: isAdmin ? 'admin' : 'student',
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).then(() => {
                    return { user, isAdmin };
                });
            })
            .then(({ user, isAdmin }) => {
                alert('Login successful! Welcome to Blujay Technologies');
                
                // Redirect based on role
                if (isAdmin) {
                    console.log('🎯 Redirecting admin to admin dashboard...');
                    window.location.href = 'admin/admin-dashboard.html';
                } else {
                    console.log('🎯 Redirecting student to dashboard...');
                    window.location.href = 'dashboard.html';
                }
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

console.log('✅ Blujay Technologies - Auth System Ready with ADMIN ROLE CHECKING (Mobile & Desktop)!');
