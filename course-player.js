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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// DUMMY COURSE CURRICULUM DATA
// ============================================
const coursesData = {
    "mern-course": {
        title: "MERN Full Stack Development",
        modules: [
            {
                id: "module1",
                title: "Introduction to MERN Stack",
                videos: [
                    { id: "v1", title: "Welcome to the Course", duration: "5:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: true },
                    { id: "v2", title: "What is MERN Stack?", duration: "12:45", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: true },
                    { id: "v3", title: "Setting Up Development Environment", duration: "18:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false }
                ]
            },
            {
                id: "module2",
                title: "MongoDB Fundamentals",
                videos: [
                    { id: "v4", title: "Introduction to MongoDB", duration: "15:10", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false },
                    { id: "v5", title: "CRUD Operations", duration: "22:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false },
                    { id: "v6", title: "Mongoose ODM", duration: "20:15", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false }
                ]
            },
            {
                id: "module3",
                title: "Express.js Backend",
                videos: [
                    { id: "v7", title: "Getting Started with Express", duration: "16:40", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false },
                    { id: "v8", title: "Routing & Middleware", duration: "25:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false },
                    { id: "v9", title: "Building REST APIs", duration: "30:15", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false }
                ]
            },
            {
                id: "module4",
                title: "React Frontend",
                videos: [
                    { id: "v10", title: "React Basics", duration: "20:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false },
                    { id: "v11", title: "Components & Props", duration: "18:45", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false },
                    { id: "v12", title: "State Management", duration: "24:10", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false }
                ]
            }
        ]
    },
    "java-course": {
        title: "Java Full Stack with Spring Boot",
        modules: [
            {
                id: "module1",
                title: "Java Fundamentals",
                videos: [
                    { id: "v1", title: "Introduction to Java", duration: "10:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: true },
                    { id: "v2", title: "OOP Concepts", duration: "25:15", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false }
                ]
            }
        ]
    },
    "data-science-course": {
        title: "Data Science & AI Mastery",
        modules: [
            {
                id: "module1",
                title: "Python for Data Science",
                videos: [
                    { id: "v1", title: "Python Basics", duration: "15:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: true }
                ]
            }
        ]
    }
};

// ============================================
// STATE VARIABLES
// ============================================
let currentCourse = null;
let currentVideoIndex = 0;
let allVideos = [];
let completedVideos = [];

// ============================================
// GET COURSE ID FROM URL
// ============================================
function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
}

// ============================================
// INITIALIZE COURSE
// ============================================
auth.onAuthStateChanged((user) => {
    if (user) {
        const courseId = getCourseIdFromURL();
        if (courseId && coursesData[courseId]) {
            currentCourse = coursesData[courseId];
            initializeCourse();
        } else {
            alert('Course not found!');
            window.location.href = 'my-learning.html';
        }
    } else {
        window.location.href = 'login.html';
    }
});

// ============================================
// INITIALIZE COURSE PLAYER
// ============================================
function initializeCourse() {
    // Set course title
    document.getElementById('course-title').textContent = currentCourse.title;
    
    // Flatten all videos into single array
    allVideos = [];
    currentCourse.modules.forEach(module => {
        module.videos.forEach(video => {
            allVideos.push({ ...video, moduleId: module.id, moduleTitle: module.title });
        });
    });
    
    // Get completed videos
    completedVideos = allVideos.filter(v => v.completed).map(v => v.id);
    
    // Find first incomplete video or last video
    currentVideoIndex = allVideos.findIndex(v => !v.completed);
    if (currentVideoIndex === -1) currentVideoIndex = 0;
    
    // Render curriculum
    renderCurriculum();
    
    // Load current video
    loadVideo(currentVideoIndex);
    
    // Update progress
    updateProgress();
    
    console.log('✅ Course initialized:', currentCourse.title);
    console.log('📚 Total videos:', allVideos.length);
    console.log('✓ Completed:', completedVideos.length);
}

// ============================================
// RENDER CURRICULUM SIDEBAR
// ============================================
function renderCurriculum() {
    const desktopContainer = document.getElementById('curriculum-container');
    const mobileContainer = document.getElementById('mobile-curriculum-container');
    
    const curriculumHTML = currentCourse.modules.map((module, moduleIndex) => {
        const moduleVideos = module.videos;
        const completedCount = moduleVideos.filter(v => v.completed).length;
        
        return `
            <div class="mb-4">
                <!-- Module Header -->
                <div class="module-header p-4 bg-gray-50 rounded-lg flex items-center justify-between" onclick="toggleModule('${module.id}')">
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-900 text-sm">Module ${moduleIndex + 1}: ${module.title}</h4>
                        <p class="text-xs text-gray-600 mt-1">${completedCount}/${moduleVideos.length} lessons • ${calculateModuleDuration(moduleVideos)}</p>
                    </div>
                    <i class="fas fa-chevron-down text-gray-600 module-icon-${module.id} transition-transform"></i>
                </div>
                
                <!-- Module Videos -->
                <div id="module-content-${module.id}" class="module-content open">
                    ${moduleVideos.map((video, videoIndex) => {
                        const globalIndex = allVideos.findIndex(v => v.id === video.id);
                        const isActive = globalIndex === currentVideoIndex;
                        const isCompleted = video.completed;
                        
                        return `
                            <div class="video-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} p-3 border-b border-gray-100 flex items-center gap-3" onclick="playVideo(${globalIndex})">
                                <!-- Status Icon -->
                                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-gray-100'}">
                                    ${isCompleted ? '<i class="fas fa-check text-green-600 text-sm"></i>' : 
                                      isActive ? '<i class="fas fa-play text-blue-600 text-sm"></i>' : 
                                      '<i class="fas fa-play text-gray-400 text-sm"></i>'}
                                </div>
                                
                                <!-- Video Info -->
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold text-gray-900 truncate">${video.title}</p>
                                    <p class="text-xs text-gray-500">${video.duration}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    desktopContainer.innerHTML = curriculumHTML;
    mobileContainer.innerHTML = curriculumHTML;
}

// ============================================
// TOGGLE MODULE ACCORDION
// ============================================
function toggleModule(moduleId) {
    const content = document.querySelectorAll(`#module-content-${moduleId}`);
    const icons = document.querySelectorAll(`.module-icon-${moduleId}`);
    
    content.forEach(el => {
        el.classList.toggle('open');
    });
    
    icons.forEach(icon => {
        icon.style.transform = content[0].classList.contains('open') ? 'rotate(0deg)' : 'rotate(-90deg)';
    });
}

// Make global
window.toggleModule = toggleModule;

// ============================================
// CALCULATE MODULE DURATION
// ============================================
function calculateModuleDuration(videos) {
    let totalMinutes = 0;
    videos.forEach(v => {
        const [min, sec] = v.duration.split(':').map(Number);
        totalMinutes += min + (sec / 60);
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// ============================================
// LOAD VIDEO
// ============================================
function loadVideo(index) {
    if (index < 0 || index >= allVideos.length) return;
    
    currentVideoIndex = index;
    const video = allVideos[index];
    
    // Update video player
    document.getElementById('video-iframe').src = video.videoUrl;
    document.getElementById('current-video-title').textContent = video.title;
    document.getElementById('current-video-description').textContent = `Module: ${video.moduleTitle}`;
    
    // Update button states
    document.getElementById('prev-btn').disabled = index === 0;
    document.getElementById('next-btn').disabled = index === allVideos.length - 1;
    
    // Re-render curriculum to highlight active video
    renderCurriculum();
    
    console.log('▶️ Playing video:', video.title);
}

// ============================================
// PLAY VIDEO (Click from sidebar)
// ============================================
function playVideo(index) {
    loadVideo(index);
    
    // Close mobile sidebar
    document.getElementById('mobile-sidebar').classList.remove('active');
}

// Make global
window.playVideo = playVideo;

// ============================================
// NAVIGATION BUTTONS
// ============================================
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentVideoIndex > 0) {
        loadVideo(currentVideoIndex - 1);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentVideoIndex < allVideos.length - 1) {
        loadVideo(currentVideoIndex + 1);
    }
});

// ============================================
// MARK VIDEO AS COMPLETE
// ============================================
document.getElementById('mark-complete-btn').addEventListener('click', () => {
    const video = allVideos[currentVideoIndex];
    
    if (!video.completed) {
        video.completed = true;
        completedVideos.push(video.id);
        
        // Update in original course data
        currentCourse.modules.forEach(module => {
            const v = module.videos.find(mv => mv.id === video.id);
            if (v) v.completed = true;
        });
        
        // Re-render
        renderCurriculum();
        updateProgress();
        
        // TODO: Save to backend
        console.log('✅ Video marked as complete:', video.title);
        
        // Auto-play next video
        if (currentVideoIndex < allVideos.length - 1) {
            setTimeout(() => {
                loadVideo(currentVideoIndex + 1);
            }, 1000);
        }
    }
});

// ============================================
// UPDATE PROGRESS
// ============================================
function updateProgress() {
    const completed = completedVideos.length;
    const total = allVideos.length;
    const percentage = Math.round((completed / total) * 100);
    
    // Update all progress indicators
    document.getElementById('video-progress').textContent = `${completed}/${total}`;
    document.getElementById('sidebar-progress').textContent = `${percentage}%`;
    document.getElementById('mobile-progress').textContent = `${percentage}%`;
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('total-count').textContent = total;
    
    // Update progress bars
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    document.getElementById('mobile-progress-bar').style.width = `${percentage}%`;
}

// ============================================
// MOBILE SIDEBAR TOGGLE
// ============================================
const mobileCurriculumBtn = document.getElementById('mobile-curriculum-btn');
const mobileSidebar = document.getElementById('mobile-sidebar');

mobileCurriculumBtn.addEventListener('click', () => {
    mobileSidebar.classList.toggle('active');
});

// Close on swipe down (simple version)
let touchStartY = 0;
mobileSidebar.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

mobileSidebar.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY > 100) {
        mobileSidebar.classList.remove('active');
    }
});

console.log('✅ Course Player loaded successfully!');

// ============================================
// PROFILE DROPDOWN FUNCTIONALITY
// ============================================
const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
    }
});

// ============================================
// LOGOUT - ✅ UPDATED TO REDIRECT TO INDEX.HTML
// ============================================
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut()
            .then(() => {
                console.log('✅ Logged out');
                window.location.href = 'index.html'; // ✅ CHANGED FROM login.html
            })
            .catch((error) => {
                console.error('❌ Logout error:', error);
                window.location.href = 'index.html'; // ✅ CHANGED FROM login.html
            });
    }
});
