// ============================================
// ADMIN DASHBOARD - Blujay Technologies
// ============================================

// Initialize Firebase (already done in auth.js)
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// CHECK ADMIN ACCESS
// ============================================
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Not logged in - redirect to login
        console.log('❌ Not authenticated, redirecting to login...');
        window.location.href = '../login.html';
    } else {
        // Check if admin
        const adminEmails = ['cheruku.harikrishna@gmail.com', 'nazeerbasha7711@gmail.com'];
        if (!adminEmails.includes(user.email)) {
            // Not admin - redirect to student dashboard
            console.log('❌ Not admin, redirecting to student dashboard...');
            alert('Access denied! Admin only.');
            window.location.href = '../dashboard.html';
        } else {
            console.log('✅ Admin access granted:', user.email);
            initializeDashboard();
        }
    }
});

// ============================================
// DUMMY DATA (Replace with API calls later)
// ============================================
const dashboardData = {
    stats: {
        totalCourses: 24,
        totalStudents: 1234,
        revenue: 250000,
        enrollments: 3456
    },
    recentActivity: [
        {
            icon: 'book',
            iconBg: 'blue',
            title: 'New course published',
            description: 'MERN Full Stack Development',
            time: '2 hours ago'
        },
        {
            icon: 'user-plus',
            iconBg: 'green',
            title: '15 new enrollments',
            description: 'Java Full Stack Course',
            time: '5 hours ago'
        },
        {
            icon: 'trophy',
            iconBg: 'purple',
            title: 'Student completed course',
            description: 'Data Science & AI Mastery',
            time: '1 day ago'
        },
        {
            icon: 'star',
            iconBg: 'yellow',
            title: 'New 5-star review',
            description: 'MERN Full Stack Development',
            time: '2 days ago'
        }
    ],
    popularCourses: [
        {
            name: 'MERN Stack',
            students: 456,
            price: 3999,
            status: 'Active',
            icon: 'code',
            iconBg: 'blue'
        },
        {
            name: 'Java Full Stack',
            students: 345,
            price: 4999,
            status: 'Active',
            icon: 'coffee',
            iconBg: 'green'
        },
        {
            name: 'Data Science & AI',
            students: 678,
            price: 6999,
            status: 'Active',
            icon: 'chart-line',
            iconBg: 'purple'
        }
    ]
};

// ============================================
// INITIALIZE DASHBOARD
// ============================================
function initializeDashboard() {
    // Update stats
    document.getElementById('total-courses').textContent = dashboardData.stats.totalCourses;
    document.getElementById('total-students').textContent = dashboardData.stats.totalStudents.toLocaleString();
    document.getElementById('total-revenue').textContent = `₹${(dashboardData.stats.revenue / 100000).toFixed(1)}L`;
    document.getElementById('total-enrollments').textContent = dashboardData.stats.enrollments.toLocaleString();

    // Setup mobile menu
    setupMobileMenu();
    
    // Setup logout
    setupLogout();
    
    console.log('✅ Admin Dashboard initialized successfully');
}

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    // Open sidebar
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.add('show');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    
    // Close sidebar
    const closeSidebar = () => {
        sidebar.classList.remove('show');
        sidebar.classList.add('-translate-x-full');
        overlay.classList.remove('show');
        overlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };
    
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // Close on window resize (desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            closeSidebar();
        }
    });
}

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            auth.signOut()
                .then(() => {
                    console.log('✅ Logged out successfully');
                    window.location.href = '../index.html';
                })
                .catch((error) => {
                    console.error('❌ Logout error:', error);
                    alert('Error logging out. Please try again.');
                });
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

// Format number
function formatNumber(num) {
    if (num >= 100000) {
        return `${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// WHEN BACKEND IS READY - API INTEGRATION
// ============================================

/*
// Fetch real dashboard data from backend
async function fetchDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        
        // Update stats
        document.getElementById('total-courses').textContent = data.totalCourses;
        document.getElementById('total-students').textContent = data.totalStudents.toLocaleString();
        document.getElementById('total-revenue').textContent = formatCurrency(data.revenue);
        document.getElementById('total-enrollments').textContent = data.enrollments.toLocaleString();
        
        console.log('✅ Dashboard data loaded from API');
    } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}
*/

console.log('✅ Admin Dashboard JS loaded');
