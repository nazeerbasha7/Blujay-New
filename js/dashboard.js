// ============================================
// FIREBASE CONFIGURATION (Same as auth.js)
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

// Initialize Firebase (prevent re-initialization)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// ✅ ADMIN EMAIL LIST
// ============================================
const ADMIN_EMAILS = ['nazeerbasha7711@gmail.com', 'cheruku.harikrishna@gmail.com'];

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let userData = {};
let selectedPhoto = null;
let interests = [];

// ============================================
// ✅ NEW: CHECK IF USER IS ADMIN & SHOW ADMIN LINK
// ============================================
function showAdminDashboardLink(userEmail) {
    if (ADMIN_EMAILS.includes(userEmail)) {
        const profileDropdown = document.getElementById('profile-dropdown');
        if (!profileDropdown) return;
        
        // Find the My Learning link
        const myLearningLink = profileDropdown.querySelector('a[href="my-learning.html"]');
        if (!myLearningLink) return;
        
        // Check if admin link already exists
        if (document.getElementById('admin-dashboard-link')) return;
        
        // Create admin dashboard link
        const adminLink = document.createElement('a');
        adminLink.id = 'admin-dashboard-link';
        adminLink.href = 'admin/admin-dashboard.html';
        adminLink.className = 'flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-all border-t border-b border-gray-100';
        adminLink.innerHTML = `
            <div class="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-user-shield text-orange-600"></i>
            </div>
            <div>
                <span class="text-sm font-medium text-gray-700">Admin Dashboard</span>
                <p class="text-xs text-gray-500">Back to admin panel</p>
            </div>
        `;
        
        // Insert after My Learning link
        myLearningLink.parentNode.insertBefore(adminLink, myLearningLink.nextSibling);
        
        console.log('✅ Admin Dashboard link added for:', userEmail);
    }
}

// ============================================
// CHECK AUTHENTICATION & LOAD USER DATA
// ============================================
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        console.log('✅ User authenticated:', user.email || user.phoneNumber);
        loadUserDataFromFirestore(user);
        
        // ✅ Show admin link if user is admin
        showAdminDashboardLink(user.email);
    } else {
        console.log('❌ No user authenticated, redirecting...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
});

// ============================================
// LOAD USER DATA FROM FIRESTORE
// ============================================
function loadUserDataFromFirestore(user) {
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                userData = doc.data();
                console.log('✅ User data loaded:', userData);
            } else {
                // Create default user data
                userData = {
                    uid: user.uid,
                    name: user.displayName || 'Student',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    profilePhoto: user.photoURL || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff',
                    bio: '',
                    interests: [],
                    socialLinks: {
                        linkedin: '',
                        github: '',
                        portfolio: ''
                    }
                };
                console.log('ℹ️ Using default user data (will be saved on first profile update)');
            }
            
            // Update UI
            updateDashboardUI(userData);
            populateProfileSidebar(userData);
        })
        .catch((error) => {
            console.error('❌ Error loading user data:', error);
            // Use fallback data
            userData = {
                name: currentUser.displayName || 'Student',
                email: currentUser.email || '',
                phoneNumber: currentUser.phoneNumber || '',
                profilePhoto: currentUser.photoURL || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff',
                bio: '',
                interests: [],
                socialLinks: { linkedin: '', github: '', portfolio: '' }
            };
            updateDashboardUI(userData);
            populateProfileSidebar(userData);
        });
}

// ============================================
// UPDATE DASHBOARD UI
// ============================================
function updateDashboardUI(data) {
    document.getElementById('user-name-header').textContent = data.name || 'Student';
    document.getElementById('user-name-dropdown').textContent = data.name || 'Student';
    document.getElementById('user-email-dropdown').textContent = data.email || data.phoneNumber || '';
    document.getElementById('welcome-name').textContent = (data.name || 'Student').split(' ')[0];
    
    const photoUrl = data.profilePhoto || 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff';
    document.getElementById('user-photo').src = photoUrl;
    document.getElementById('sidebar-photo').src = photoUrl;
}

// ============================================
// POPULATE PROFILE SIDEBAR
// ============================================
function populateProfileSidebar(data) {
    document.getElementById('edit-name').value = data.name || '';
    document.getElementById('edit-email').value = data.email || '';
    document.getElementById('edit-phone').value = data.phoneNumber || '';
    document.getElementById('edit-bio').value = data.bio || '';
    document.getElementById('edit-linkedin').value = data.socialLinks?.linkedin || '';
    document.getElementById('edit-github').value = data.socialLinks?.github || '';
    document.getElementById('edit-portfolio').value = data.socialLinks?.portfolio || '';
    
    updateBioCount();
    renderInterests(data.interests || []);
}

// ============================================
// PROFILE DROPDOWN TOGGLE
// ============================================
const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
    }
});

// ============================================
// PROFILE SIDEBAR OPEN/CLOSE
// ============================================
const openProfileBtn = document.getElementById('open-profile-btn');
const closeSidebarBtn = document.getElementById('close-sidebar');
const profileSidebar = document.getElementById('profile-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    profileSidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    profileDropdown.classList.add('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    profileSidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

openProfileBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileSidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// ============================================
// PHOTO UPLOAD (Preview Only)
// ============================================
const photoUploadInput = document.getElementById('photo-upload');
const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const removePhotoBtn = document.getElementById('remove-photo-btn');
const photoUploadWrapper = document.querySelector('.photo-upload-wrapper');
const sidebarPhoto = document.getElementById('sidebar-photo');

uploadPhotoBtn.addEventListener('click', () => photoUploadInput.click());
photoUploadWrapper.addEventListener('click', () => photoUploadInput.click());

photoUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        
        selectedPhoto = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            sidebarPhoto.src = e.target.result;
        };
        reader.readAsDataURL(file);
        console.log('✅ Photo selected:', file.name);
    }
});

removePhotoBtn.addEventListener('click', () => {
    if (confirm('Remove your profile photo?')) {
        sidebarPhoto.src = 'https://ui-avatars.com/api/?name=Student&background=1D5D7F&color=fff';
        selectedPhoto = null;
        photoUploadInput.value = '';
    }
});

// ============================================
// BIO CHARACTER COUNT
// ============================================
const editBio = document.getElementById('edit-bio');
const bioCount = document.getElementById('bio-count');

function updateBioCount() {
    const count = editBio.value.length;
    bioCount.textContent = count;
    if (count > 200) {
        bioCount.style.color = 'red';
        editBio.value = editBio.value.substring(0, 200);
    } else {
        bioCount.style.color = '';
    }
}

editBio.addEventListener('input', updateBioCount);

// ============================================
// INTERESTS/SKILLS MANAGEMENT
// ============================================
const interestsContainer = document.getElementById('interests-container');
const newInterestInput = document.getElementById('new-interest');
const addInterestBtn = document.getElementById('add-interest-btn');

function renderInterests(interestsList) {
    interests = interestsList || [];
    interestsContainer.innerHTML = '';
    
    if (interests.length === 0) {
        interestsContainer.innerHTML = '<p class="text-sm text-gray-500">No skills added yet</p>';
        return;
    }
    
    interests.forEach((interest, index) => {
        const tag = document.createElement('div');
        tag.className = 'interest-tag';
        tag.innerHTML = `${interest}<button onclick="removeInterest(${index})" title="Remove"><i class="fas fa-times"></i></button>`;
        interestsContainer.appendChild(tag);
    });
}

function addInterest() {
    const interest = newInterestInput.value.trim();
    if (!interest) {
        alert('Please enter a skill');
        return;
    }
    if (interests.includes(interest)) {
        alert('This skill is already added');
        return;
    }
    if (interests.length >= 10) {
        alert('Maximum 10 skills allowed');
        return;
    }
    interests.push(interest);
    newInterestInput.value = '';
    renderInterests(interests);
}

function removeInterest(index) {
    interests.splice(index, 1);
    renderInterests(interests);
}

window.removeInterest = removeInterest;

addInterestBtn.addEventListener('click', addInterest);
newInterestInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addInterest();
    }
});

// ============================================
// SAVE PROFILE (TO FIRESTORE)
// ============================================
const saveProfileBtn = document.getElementById('save-profile-btn');

saveProfileBtn.addEventListener('click', () => {
    saveProfileBtn.disabled = true;
    saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
    
    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const linkedin = document.getElementById('edit-linkedin').value.trim();
    const github = document.getElementById('edit-github').value.trim();
    const portfolio = document.getElementById('edit-portfolio').value.trim();
    
    if (!name) {
        alert('Name is required');
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
        return;
    }
    
    const updatedData = {
        name: name,
        phoneNumber: phone,
        bio: bio,
        interests: interests,
        socialLinks: { linkedin, github, portfolio },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(currentUser.uid).set(updatedData, { merge: true })
        .then(() => {
            console.log('✅ Profile updated successfully');
            userData = { ...userData, ...updatedData };
            updateDashboardUI(userData);
            
            saveProfileBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Saved!';
            saveProfileBtn.className = 'w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm sm:text-base';
            
            setTimeout(() => {
                saveProfileBtn.className = 'w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md text-sm sm:text-base';
                saveProfileBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
                saveProfileBtn.disabled = false;
                closeSidebar();
            }, 1500);
        })
        .catch((error) => {
            console.error('❌ Error saving profile:', error);
            alert('Error saving profile: ' + error.message);
            saveProfileBtn.disabled = false;
            saveProfileBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
        });
});

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.getElementById('logout-btn');
const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut()
            .then(() => {
                console.log('✅ Logged out');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('❌ Logout error:', error);
                window.location.href = 'index.html';
            });
    }
}

logoutBtn.addEventListener('click', handleLogout);
sidebarLogoutBtn.addEventListener('click', handleLogout);

// ============================================
// COURSE ENROLLMENT FUNCTIONALITY
// ============================================
function loadCourses() {
    db.collection('courses')
        .where('status', '==', 'published')
        .get()
        .then((snapshot) => {
            const coursesContainer = document.getElementById('courses-grid');
            if (!coursesContainer) return;
            
            coursesContainer.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const course = doc.data();
                const courseCard = createCourseCard(doc.id, course);
                coursesContainer.innerHTML += courseCard;
            });
            
            attachEnrollmentHandlers();
        })
        .catch((error) => {
            console.error('❌ Error loading courses:', error);
        });
}

function createCourseCard(courseId, course) {
    const originalPrice = course.price || 4999;
    const discountPrice = course.discountPrice || originalPrice;
    const discount = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
    
    return `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div class="relative">
                <img src="${course.thumbnail || 'https://via.placeholder.com/400x225'}" alt="${course.title}" class="w-full h-48 object-cover">
                <div class="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ₹${discountPrice.toLocaleString()}
                </div>
                ${discount > 0 ? `<div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">${discount}% OFF</div>` : ''}
            </div>
            <div class="p-5">
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">${course.title}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${course.description || 'Learn professional skills with expert instructors'}</p>
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <span class="text-yellow-500">⭐</span>
                        <span class="text-sm font-semibold text-gray-700">${course.rating || '4.8'}</span>
                        <span class="text-sm text-gray-500">(${course.students || '1,234'})</span>
                    </div>
                    <span class="text-sm text-gray-500">
                        <i class="far fa-clock mr-1"></i>${course.duration || '8 months'}
                    </span>
                </div>
                <button onclick="enrollInCourse('${courseId}', '${course.title}')" 
                    class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                    Enroll Now
                </button>
            </div>
        </div>
    `;
}

function attachEnrollmentHandlers() {
    console.log('✅ Enrollment handlers attached');
}

window.enrollInCourse = function(courseId, courseTitle) {
    if (!currentUser) {
        alert('Please login to enroll in courses');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Enrolling in course:', courseId);
    
    db.collection('enrollments')
        .where('userId', '==', currentUser.uid)
        .where('courseId', '==', courseId)
        .get()
        .then((snapshot) => {
            if (!snapshot.empty) {
                alert('You are already enrolled in this course!');
                window.location.href = 'my-learning.html';
                return;
            }
            
            return db.collection('enrollments').add({
                userId: currentUser.uid,
                courseId: courseId,
                courseTitle: courseTitle,
                enrolledAt: firebase.firestore.FieldValue.serverTimestamp(),
                progress: 0,
                status: 'active'
            });
        })
        .then((docRef) => {
            if (docRef) {
                console.log('✅ Enrollment successful:', docRef.id);
                alert(`Successfully enrolled in ${courseTitle}!`);
                window.location.href = 'my-learning.html';
            }
        })
        .catch((error) => {
            console.error('❌ Enrollment error:', error);
            alert('Error enrolling in course. Please try again.');
        });
};

if (document.getElementById('courses-grid')) {
    loadCourses();
}

console.log('✅ Dashboard loaded successfully!');
console.log('📱 Mobile responsive: YES');
console.log('🎨 Profile sidebar: YES');
console.log('🔥 Firebase integration: YES');
