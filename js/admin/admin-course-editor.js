// ============================================
// ADMIN COURSE EDITOR - Blujay Technologies
// Add/Edit Course Form
// ============================================

const auth = firebase.auth();
const db = firebase.firestore();

let isEditMode = false;
let editCourseId = null;

// ============================================
// CHECK ADMIN ACCESS
// ============================================
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '../login.html';
    } else {
        const adminEmails = ['cheruku.harikrishna@gmail.com', 'nazeerbasha7711@gmail.com'];
        if (!adminEmails.includes(user.email)) {
            alert('Access denied! Admin only.');
            window.location.href = '../dashboard.html';
        } else {
            console.log('✅ Admin access granted');
            initializePage();
        }
    }
});

// ============================================
// INITIALIZE PAGE
// ============================================
function initializePage() {
    setupMobileMenu();
    setupLogout();
    setupForm();
    checkEditMode();
    
    console.log('✅ Course Editor initialized');
}

// ============================================
// CHECK IF EDITING EXISTING COURSE
// ============================================
function checkEditMode() {
    editCourseId = localStorage.getItem('editCourseId');
    
    if (editCourseId) {
        isEditMode = true;
        document.getElementById('page-title').textContent = 'Edit Course';
        document.getElementById('save-text').textContent = 'Update Course';
        loadCourseData(editCourseId);
    }
}

// ============================================
// LOAD COURSE DATA FOR EDITING
// ============================================
function loadCourseData(courseId) {
    // Dummy data - Replace with API call
    const coursesData = [
        {
            id: 'course1',
            title: 'MERN Full Stack Development',
            description: 'Complete MERN stack course with hands-on projects',
            category: 'full-stack',
            level: 'intermediate',
            instructor: 'John Doe',
            price: 4999,
            discountedPrice: 3999,
            duration: '8 months',
            language: 'english',
            thumbnail: 'https://via.placeholder.com/800x450?text=MERN',
            status: 'published'
        }
    ];
    
    const course = coursesData.find(c => c.id === courseId);
    
    if (course) {
        document.getElementById('course-title').value = course.title;
        document.getElementById('course-description').value = course.description;
        document.getElementById('course-category').value = course.category;
        document.getElementById('course-level').value = course.level;
        document.getElementById('instructor-name').value = course.instructor;
        document.getElementById('course-price').value = course.price;
        document.getElementById('course-discount-price').value = course.discountedPrice;
        document.getElementById('course-duration').value = course.duration;
        document.getElementById('course-language').value = course.language;
        document.getElementById('course-thumbnail').value = course.thumbnail;
        document.getElementById('course-status').value = course.status;
        
        updateCharCount();
    }
}

// ============================================
// SETUP FORM
// ============================================
function setupForm() {
    const form = document.getElementById('course-form');
    const descriptionField = document.getElementById('course-description');
    
    // Character count for description
    descriptionField.addEventListener('input', updateCharCount);
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
}

function updateCharCount() {
    const descriptionField = document.getElementById('course-description');
    const charCount = document.getElementById('desc-count');
    charCount.textContent = descriptionField.value.length;
}

// ============================================
// HANDLE FORM SUBMISSION
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('save-btn');
    const saveText = document.getElementById('save-text');
    const originalText = saveText.textContent;
    
    // Disable button and show loading
    saveBtn.disabled = true;
    saveText.textContent = isEditMode ? 'Updating...' : 'Saving...';
    
    // Get form data
    const courseData = {
        id: isEditMode ? editCourseId : 'course' + Date.now(),
        title: document.getElementById('course-title').value.trim(),
        description: document.getElementById('course-description').value.trim(),
        category: document.getElementById('course-category').value,
        level: document.getElementById('course-level').value,
        instructor: document.getElementById('instructor-name').value.trim(),
        price: parseInt(document.getElementById('course-price').value),
        discountedPrice: parseInt(document.getElementById('course-discount-price').value) || parseInt(document.getElementById('course-price').value),
        duration: document.getElementById('course-duration').value.trim() || 'Self-paced',
        language: document.getElementById('course-language').value,
        thumbnail: document.getElementById('course-thumbnail').value.trim() || 'https://via.placeholder.com/800x450?text=Course',
        status: document.getElementById('course-status').value,
        students: isEditMode ? undefined : 0,
        createdAt: isEditMode ? undefined : new Date().toISOString()
    };
    
    // Validate
    if (courseData.discountedPrice > courseData.price) {
        alert('Discounted price cannot be greater than regular price');
        saveBtn.disabled = false;
        saveText.textContent = originalText;
        return;
    }
    
    // Simulate API call (Replace with actual API when backend is ready)
    setTimeout(() => {
        console.log(isEditMode ? 'Updating course:' : 'Creating course:', courseData);
        
        // Success
        showToast(
            isEditMode ? 'Course updated successfully!' : 'Course created successfully!',
            'success'
        );
        
        // Clear edit mode
        localStorage.removeItem('editCourseId');
        
        // Redirect to courses page
        setTimeout(() => {
            window.location.href = 'admin-courses.html';
        }, 1000);
        
    }, 1500);
    
    /*
    // TODO: When backend is ready, use this:
    const endpoint = isEditMode ? `/api/courses/${editCourseId}` : '/api/courses';
    const method = isEditMode ? 'PUT' : 'POST';
    
    fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify(courseData)
    })
    .then(response => response.json())
    .then(data => {
        showToast('Course saved successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'admin-courses.html';
        }, 1000);
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error saving course. Please try again.', 'error');
        saveBtn.disabled = false;
        saveText.textContent = originalText;
    });
    */
}

// ============================================
// MOBILE MENU
// ============================================
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    menuBtn.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    });
    
    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    };
    
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
}

// ============================================
// LOGOUT
// ============================================
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            auth.signOut().then(() => {
                window.location.href = '../index.html';
            });
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

console.log('✅ Course Editor JS loaded');
