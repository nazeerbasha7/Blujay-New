// ============================================
// ADMIN CURRICULUM BUILDER - Blujay Technologies
// Manage course modules and videos
// ============================================

const auth = firebase.auth();
const db = firebase.firestore();

let selectedCourse = null;
let curriculum = [];
let moduleCounter = 0;
let videoCounter = 0;

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
    setupCourseSelector();
    setupModals();
    
    // Check if course ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    if (courseId) {
        document.getElementById('course-selector').value = courseId;
        loadCurriculum(courseId);
    }
    
    console.log('✅ Curriculum Builder initialized');
}

// ============================================
// SETUP COURSE SELECTOR
// ============================================
function setupCourseSelector() {
    const selector = document.getElementById('course-selector');
    
    selector.addEventListener('change', (e) => {
        const courseId = e.target.value;
        if (courseId) {
            loadCurriculum(courseId);
        } else {
            showEmptyState();
        }
    });
}

// ============================================
// LOAD CURRICULUM
// ============================================
function loadCurriculum(courseId) {
    selectedCourse = courseId;
    
    // Dummy data - Replace with API call
    const curriculumData = {
        'course1': [
            {
                id: 'module1',
                title: 'Introduction to MERN Stack',
                order: 1,
                videos: [
                    { id: 'v1', title: 'Welcome to Course', url: 'https://youtube.com/embed/abc', duration: '5:30', isFree: true },
                    { id: 'v2', title: 'What is MERN?', url: 'https://youtube.com/embed/def', duration: '12:45', isFree: false }
                ]
            },
            {
                id: 'module2',
                title: 'MongoDB Fundamentals',
                order: 2,
                videos: [
                    { id: 'v3', title: 'Introduction to MongoDB', url: 'https://youtube.com/embed/ghi', duration: '15:10', isFree: false }
                ]
            }
        ]
    };
    
    curriculum = curriculumData[courseId] || [];
    renderCurriculum();
    
    // Update UI
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('modules-list').classList.remove('hidden');
    document.getElementById('save-container').classList.remove('hidden');
}

// ============================================
// RENDER CURRICULUM
// ============================================
function renderCurriculum() {
    const container = document.getElementById('modules-list');
    
    if (curriculum.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800 mb-2">No Modules Yet</h3>
                <p class="text-gray-600 mb-6">Start building your curriculum by adding modules</p>
                <button onclick="addModule()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Add First Module
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = curriculum.map((module, moduleIndex) => `
        <div class="module-card" data-module-id="${module.id}">
            <div class="module-header">
                <div class="flex items-center flex-1 space-x-3">
                    <i class="fas fa-grip-vertical text-gray-400 cursor-move"></i>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800">${module.title}</h4>
                        <p class="text-sm text-gray-500">${module.videos.length} videos</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="editModule('${module.id}')" class="action-btn action-btn-edit" title="Edit module">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteModule('${module.id}')" class="action-btn action-btn-delete" title="Delete module">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="mt-4 space-y-2">
                ${module.videos.map((video, videoIndex) => `
                    <div class="video-item" data-video-id="${video.id}">
                        <i class="fas fa-grip-vertical text-gray-400 cursor-move"></i>
                        <i class="fas fa-play-circle text-blue-600"></i>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-800 truncate">${video.title}</p>
                            <p class="text-xs text-gray-500">${video.duration}${video.isFree ? ' • Free' : ''}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="editVideo('${module.id}', '${video.id}')" class="text-blue-600 hover:text-blue-700">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteVideo('${module.id}', '${video.id}')" class="text-red-600 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
                
                <button onclick="addVideo('${module.id}')" class="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <i class="fas fa-plus mr-2"></i>Add Video
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// MODULE OPERATIONS
// ============================================
function addModule() {
    if (!selectedCourse) {
        alert('Please select a course first');
        return;
    }
    
    document.getElementById('module-modal').classList.remove('hidden');
}

function closeModuleModal() {
    document.getElementById('module-modal').classList.add('hidden');
    document.getElementById('module-form').reset();
}

function setupModals() {
    // Module form
    document.getElementById('module-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('module-title').value.trim();
        
        const newModule = {
            id: 'module' + (++moduleCounter),
            title: title,
            order: curriculum.length + 1,
            videos: []
        };
        
        curriculum.push(newModule);
        renderCurriculum();
        closeModuleModal();
        showToast('Module added successfully', 'success');
    });
    
    // Video form
    document.getElementById('video-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const moduleId = document.getElementById('video-module-id').value;
        const title = document.getElementById('video-title').value.trim();
        const url = document.getElementById('video-url').value.trim();
        const duration = document.getElementById('video-duration').value.trim();
        const isFree = document.getElementById('video-free').checked;
        
        const module = curriculum.find(m => m.id === moduleId);
        if (module) {
            const newVideo = {
                id: 'v' + (++videoCounter),
                title: title,
                url: url,
                duration: duration,
                isFree: isFree
            };
            
            module.videos.push(newVideo);
            renderCurriculum();
            closeVideoModal();
            showToast('Video added successfully', 'success');
        }
    });
}

function editModule(moduleId) {
    const module = curriculum.find(m => m.id === moduleId);
    if (module) {
        const newTitle = prompt('Edit module title:', module.title);
        if (newTitle && newTitle.trim()) {
            module.title = newTitle.trim();
            renderCurriculum();
            showToast('Module updated', 'success');
        }
    }
}

function deleteModule(moduleId) {
    if (confirm('Are you sure you want to delete this module and all its videos?')) {
        curriculum = curriculum.filter(m => m.id !== moduleId);
        renderCurriculum();
        showToast('Module deleted', 'success');
    }
}

// ============================================
// VIDEO OPERATIONS
// ============================================
function addVideo(moduleId) {
    document.getElementById('video-module-id').value = moduleId;
    document.getElementById('video-modal').classList.remove('hidden');
}

function closeVideoModal() {
    document.getElementById('video-modal').classList.add('hidden');
    document.getElementById('video-form').reset();
}

function editVideo(moduleId, videoId) {
    const module = curriculum.find(m => m.id === moduleId);
    const video = module?.videos.find(v => v.id === videoId);
    
    if (video) {
        const newTitle = prompt('Edit video title:', video.title);
        if (newTitle && newTitle.trim()) {
            video.title = newTitle.trim();
            renderCurriculum();
            showToast('Video updated', 'success');
        }
    }
}

function deleteVideo(moduleId, videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        const module = curriculum.find(m => m.id === moduleId);
        if (module) {
            module.videos = module.videos.filter(v => v.id !== videoId);
            renderCurriculum();
            showToast('Video deleted', 'success');
        }
    }
}

// ============================================
// SAVE CURRICULUM
// ============================================
function saveCurriculum() {
    if (!selectedCourse) {
        alert('No course selected');
        return;
    }
    
    console.log('Saving curriculum for course:', selectedCourse);
    console.log('Curriculum data:', curriculum);
    
    showToast('Curriculum saved successfully!', 'success');
    
    // TODO: When backend is ready, call API
    /*
    fetch(`/api/courses/${selectedCourse}/curriculum`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify({ curriculum })
    })
    .then(response => response.json())
    .then(data => {
        showToast('Curriculum saved successfully!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error saving curriculum', 'error');
    });
    */
}

// ============================================
// SHOW EMPTY STATE
// ============================================
function showEmptyState() {
    selectedCourse = null;
    curriculum = [];
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('modules-list').classList.add('hidden');
    document.getElementById('save-container').classList.add('hidden');
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
// UTILITIES
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

// Make functions global
window.addModule = addModule;
window.closeModuleModal = closeModuleModal;
window.editModule = editModule;
window.deleteModule = deleteModule;
window.addVideo = addVideo;
window.closeVideoModal = closeVideoModal;
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;
window.saveCurriculum = saveCurriculum;

console.log('✅ Curriculum Builder JS loaded');
