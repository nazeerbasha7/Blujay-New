// ============================================
// ADMIN COURSES - Blujay Technologies
// Course Management with CRUD Operations
// ============================================

const auth = firebase.auth();
const db = firebase.firestore();

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
// DUMMY COURSES DATA
// Replace with API calls when backend is ready
// ============================================
let coursesData = [
    {
        id: 'course1',
        title: 'MERN Full Stack Development',
        instructor: 'John Doe',
        students: 456,
        price: 4999,
        discountedPrice: 3999,
        category: 'full-stack',
        status: 'published',
        thumbnail: 'https://via.placeholder.com/100x60?text=MERN',
        createdAt: '2025-01-15'
    },
    {
        id: 'course2',
        title: 'Java Full Stack with Spring Boot',
        instructor: 'Jane Smith',
        students: 345,
        price: 5999,
        discountedPrice: 4999,
        category: 'full-stack',
        status: 'published',
        thumbnail: 'https://via.placeholder.com/100x60?text=JAVA',
        createdAt: '2025-02-10'
    },
    {
        id: 'course3',
        title: 'Data Science & AI Mastery',
        instructor: 'Dr. Mike Johnson',
        students: 678,
        price: 7999,
        discountedPrice: 6999,
        category: 'data-science',
        status: 'published',
        thumbnail: 'https://via.placeholder.com/100x60?text=DS+AI',
        createdAt: '2025-01-20'
    },
    {
        id: 'course4',
        title: 'Cyber Security Essentials',
        instructor: 'Sarah Williams',
        students: 234,
        price: 5999,
        discountedPrice: 4999,
        category: 'cybersecurity',
        status: 'published',
        thumbnail: 'https://via.placeholder.com/100x60?text=CYBER',
        createdAt: '2025-03-01'
    },
    {
        id: 'course5',
        title: 'Python Programming Masterclass',
        instructor: 'John Doe',
        students: 0,
        price: 3999,
        discountedPrice: 2999,
        category: 'full-stack',
        status: 'draft',
        thumbnail: 'https://via.placeholder.com/100x60?text=PYTHON',
        createdAt: '2025-03-15'
    }
];

// Filtered courses
let filteredCourses = [...coursesData];
let currentPage = 1;
const coursesPerPage = 10;
let courseToDelete = null;

// ============================================
// INITIALIZE PAGE
// ============================================
function initializePage() {
    setupMobileMenu();
    setupLogout();
    setupFilters();
    setupSearch();
    setupSelectAll();
    setupDeleteModal();
    renderCourses();
    
    console.log('✅ Courses page initialized');
}

// ============================================
// RENDER COURSES TABLE
// ============================================
function renderCourses() {
    const tbody = document.getElementById('courses-table-body');
    
    if (filteredCourses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12">
                    <div class="empty-state">
                        <i class="fas fa-folder-open empty-state-icon"></i>
                        <p class="empty-state-title">No courses found</p>
                        <p class="empty-state-text">Try adjusting your filters or add a new course</p>
                        <a href="admin-course-editor.html" class="btn-primary mt-4">
                            <i class="fas fa-plus mr-2"></i>Add Course
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = Math.min(startIndex + coursesPerPage, filteredCourses.length);
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);
    
    tbody.innerHTML = coursesToShow.map(course => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td>
                <input type="checkbox" class="course-checkbox rounded" data-id="${course.id}">
            </td>
            <td>
                <div class="flex items-center space-x-3">
                    <img src="${course.thumbnail}" alt="${course.title}" class="w-16 h-10 rounded object-cover flex-shrink-0">
                    <div class="min-w-0">
                        <p class="font-semibold text-gray-800 truncate">${course.title}</p>
                        <p class="text-xs text-gray-500">${course.category}</p>
                    </div>
                </div>
            </td>
            <td class="hidden md:table-cell">
                <span class="text-sm text-gray-700">${course.instructor}</span>
            </td>
            <td class="hidden sm:table-cell">
                <span class="text-sm font-medium text-gray-800">${course.students}</span>
            </td>
            <td class="hidden lg:table-cell">
                <div>
                    <span class="text-sm font-bold text-gray-800">₹${course.discountedPrice.toLocaleString()}</span>
                    ${course.price !== course.discountedPrice ? 
                        `<br><span class="text-xs text-gray-500 line-through">₹${course.price.toLocaleString()}</span>` 
                        : ''}
                </div>
            </td>
            <td>
                <span class="badge badge-${course.status}">${capitalize(course.status)}</span>
            </td>
            <td>
                <div class="flex items-center gap-2">
                    <button onclick="editCourse('${course.id}')" class="action-btn action-btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="viewCourse('${course.id}')" class="action-btn action-btn-view" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="openDeleteModal('${course.id}')" class="action-btn action-btn-delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Update pagination info
    document.getElementById('showing-start').textContent = startIndex + 1;
    document.getElementById('showing-end').textContent = endIndex;
    document.getElementById('total-courses').textContent = filteredCourses.length;
}

// ============================================
// SETUP FILTERS
// ============================================
function setupFilters() {
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    statusFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    filteredCourses = coursesData.filter(course => {
        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
        const matchesSearch = course.title.toLowerCase().includes(searchTerm) || 
                             course.instructor.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesCategory && matchesSearch;
    });
    
    currentPage = 1;
    renderCourses();
}

// ============================================
// SETUP SEARCH
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });
}

// ============================================
// SETUP SELECT ALL
// ============================================
function setupSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.course-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });
}

// ============================================
// COURSE ACTIONS
// ============================================
function editCourse(courseId) {
    console.log('Edit course:', courseId);
    // Store course ID in localStorage for editing
    localStorage.setItem('editCourseId', courseId);
    window.location.href = 'admin-course-editor.html';
}

function viewCourse(courseId) {
    console.log('View course:', courseId);
    const course = coursesData.find(c => c.id === courseId);
    showToast(`Viewing: ${course.title}`, 'info');
    // Navigate to curriculum builder or preview
    window.location.href = `admin-curriculum.html?courseId=${courseId}`;
}

function openDeleteModal(courseId) {
    courseToDelete = courseId;
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
}

// ============================================
// DELETE MODAL
// ============================================
function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        courseToDelete = null;
    });
    
    confirmBtn.addEventListener('click', () => {
        if (courseToDelete) {
            deleteCourse(courseToDelete);
            modal.classList.add('hidden');
            courseToDelete = null;
        }
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            courseToDelete = null;
        }
    });
}

function deleteCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    
    // Remove from array
    coursesData = coursesData.filter(c => c.id !== courseId);
    filteredCourses = filteredCourses.filter(c => c.id !== courseId);
    
    renderCourses();
    showToast(`Course "${course.title}" deleted successfully`, 'success');
    
    console.log('Deleted course:', courseId);
    
    // TODO: When backend is ready, call API to delete
    // await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
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
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Make functions global for onclick handlers
window.editCourse = editCourse;
window.viewCourse = viewCourse;
window.openDeleteModal = openDeleteModal;

console.log('✅ Admin Courses JS loaded');
