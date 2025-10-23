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
// DUMMY COURSE DATA (Replace with real API later)
// ============================================
const enrolledCourses = [
    {
        id: "mern-course",
        title: "MERN Full Stack Development",
        instructor: "John Doe",
        thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=250&fit=crop",
        totalVideos: 50,
        completedVideos: 18,
        progress: 36,
        totalDuration: "18h 30m",
        remainingTime: "11h 45m",
        lastWatched: "2 days ago",
        nextVideo: "Introduction to React Hooks",
        difficulty: "Intermediate",
        status: "in-progress",
        certificateEligible: false,
        enrolledDate: "2025-10-01"
    },
    {
        id: "java-course",
        title: "Java Full Stack with Spring Boot",
        instructor: "Sarah Williams",
        thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
        totalVideos: 45,
        completedVideos: 30,
        progress: 67,
        totalDuration: "16h 20m",
        remainingTime: "5h 25m",
        lastWatched: "Yesterday",
        nextVideo: "Building REST APIs",
        difficulty: "Advanced",
        status: "in-progress",
        certificateEligible: false,
        enrolledDate: "2025-09-15"
    },
    {
        id: "data-science-course",
        title: "Data Science & AI Mastery",
        instructor: "Dr. Michael Chen",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        totalVideos: 60,
        completedVideos: 60,
        progress: 100,
        totalDuration: "22h 10m",
        remainingTime: "0h 0m",
        lastWatched: "1 week ago",
        nextVideo: null,
        difficulty: "Advanced",
        status: "completed",
        certificateEligible: true,
        enrolledDate: "2025-08-20"
    }
];

// ============================================
// CHECK AUTHENTICATION
// ============================================
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ User authenticated:', user.email || user.phoneNumber);
        loadEnrolledCourses();
    } else {
        console.log('❌ No user authenticated, redirecting...');
        window.location.href = 'login.html';
    }
});

// ============================================
// LOAD ENROLLED COURSES
// ============================================
function loadEnrolledCourses(filter = 'all') {
    const container = document.getElementById('courses-container');
    const emptyState = document.getElementById('empty-state');
    
    // Filter courses based on status
    let filteredCourses = enrolledCourses;
    if (filter === 'in-progress') {
        filteredCourses = enrolledCourses.filter(c => c.status === 'in-progress');
    } else if (filter === 'completed') {
        filteredCourses = enrolledCourses.filter(c => c.status === 'completed');
    }
    
    // Show empty state if no courses
    if (filteredCourses.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
    }
    
    // Hide empty state
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Render courses
    container.innerHTML = filteredCourses.map(course => createCourseCard(course)).join('');
    
    console.log(`✅ Loaded ${filteredCourses.length} courses (filter: ${filter})`);
}

// ============================================
// CREATE COURSE CARD HTML
// ============================================
function createCourseCard(course) {
    const progressColor = course.progress === 100 ? 'bg-green-600' : 'bg-blue-600';
    const certificateBadge = course.certificateEligible ? `
        <div class="certificate-badge flex items-center gap-2 mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <i class="fas fa-certificate text-green-600"></i>
            <span class="text-xs font-semibold text-green-700">Certificate Ready</span>
        </div>
    ` : '';
    
    const difficultyColor = {
        'Beginner': 'bg-green-100 text-green-700',
        'Intermediate': 'bg-yellow-100 text-yellow-700',
        'Advanced': 'bg-red-100 text-red-700'
    }[course.difficulty];
    
    return `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
            <!-- Thumbnail -->
            <div class="relative">
                <img src="${course.thumbnail}" alt="${course.title}" class="w-full h-40 sm:h-48 object-cover">
                <div class="absolute top-3 left-3 px-3 py-1 ${difficultyColor} rounded-full text-xs font-bold">
                    ${course.difficulty}
                </div>
                ${course.status === 'completed' ? `
                    <div class="absolute top-3 right-3 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-check text-white"></i>
                    </div>
                ` : ''}
            </div>
            
            <!-- Content -->
            <div class="p-5">
                <!-- Title & Instructor -->
                <h3 class="text-lg font-bold text-gray-900 mb-1 line-clamp-2">${course.title}</h3>
                <p class="text-sm text-gray-600 mb-4">By: ${course.instructor}</p>
                
                <!-- Progress Bar -->
                <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-900">${course.progress}% Complete</span>
                        <span class="text-xs text-gray-500">${course.completedVideos}/${course.totalVideos} videos</span>
                    </div>
                    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="progress-bar h-full ${progressColor}" style="width: ${course.progress}%"></div>
                    </div>
                </div>
                
                <!-- Stats -->
                <div class="flex items-center justify-between mb-4 text-xs text-gray-600">
                    <span><i class="far fa-clock mr-1"></i>${course.remainingTime} left</span>
                    <span><i class="far fa-calendar mr-1"></i>Last: ${course.lastWatched}</span>
                </div>
                
                <!-- Next Video -->
                ${course.nextVideo ? `
                    <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p class="text-xs text-gray-600 mb-1">🎯 Next up:</p>
                        <p class="text-sm font-semibold text-gray-900">${course.nextVideo}</p>
                    </div>
                ` : ''}
                
                <!-- Certificate Badge -->
                ${certificateBadge}
                
                <!-- Action Button -->
                <button onclick="openCourse('${course.id}')" class="w-full mt-4 ${course.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                    <i class="fas ${course.status === 'completed' ? 'fa-trophy' : 'fa-play'}"></i>
                    <span>${course.status === 'completed' ? 'View Certificate' : 'Continue Learning'}</span>
                </button>
            </div>
        </div>
    `;
}

// ============================================
// OPEN COURSE (Navigate to course player)
// ============================================
function openCourse(courseId) {
    console.log('🎬 Opening course:', courseId);
    window.location.href = `course-player.html?courseId=${courseId}`;
}

// Make function global
window.openCourse = openCourse;

// ============================================
// FILTER BUTTONS
// ============================================
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-700');
        });
        
        // Add active class to clicked button
        this.classList.remove('bg-gray-100', 'text-gray-700');
        this.classList.add('bg-blue-600', 'text-white');
        
        // Load courses with filter
        const filter = this.getAttribute('data-filter');
        loadEnrolledCourses(filter);
    });
});

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

console.log('✅ My Learning page loaded!');
console.log('📚 Total enrolled courses:', enrolledCourses.length);
