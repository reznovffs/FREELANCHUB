// Global variables
let currentUser = null;
let currentPage = 1;
let currentFilters = {};

// API Base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadJobs();
});

// Initialize app
function initializeApp() {
    // Check for stored token
    const token = localStorage.getItem('token');
    if (token) {
        fetchUserProfile();
    }
    
    // Setup mobile navigation
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('post-job-form').addEventListener('submit', handlePostJob);
    document.getElementById('apply-form').addEventListener('submit', handleApplyJob);
    
    // Search and filters
    document.getElementById('search-input').addEventListener('input', debounce(handleSearch, 500));
    document.getElementById('category-filter').addEventListener('change', handleFilterChange);
    document.getElementById('experience-filter').addEventListener('change', handleFilterChange);
    
    // Modal close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            updateUIForUser();
            closeModal('login-modal');
            showMessage('Login successful!', 'success');
            loadJobs();
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            updateUIForUser();
            closeModal('register-modal');
            showMessage('Registration successful!', 'success');
            loadJobs();
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function fetchUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateUIForUser();
        } else {
            localStorage.removeItem('token');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function updateUIForUser() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = currentUser.name;
        
        // Show/hide sections based on user role
        const postJobSection = document.getElementById('post-job');
        if (currentUser.role === 'client' || currentUser.role === 'admin') {
            postJobSection.style.display = 'block';
        } else {
            postJobSection.style.display = 'none';
        }
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateUIForUser();
    showMessage('Logged out successfully', 'success');
    loadJobs();
}

// Job management functions
async function loadJobs(page = 1) {
    const jobsGrid = document.getElementById('jobs-grid');
    jobsGrid.innerHTML = '<div class="loading">Loading jobs...</div>';
    
    try {
        const params = new URLSearchParams({
            page,
            limit: 12,
            ...currentFilters
        });
        
        const response = await fetch(`${API_BASE}/jobs?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            displayJobs(data.jobs);
            displayPagination(data.pagination);
            currentPage = page;
        } else {
            showMessage('Failed to load jobs', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function displayJobs(jobs) {
    const jobsGrid = document.getElementById('jobs-grid');
    
    if (jobs.length === 0) {
        jobsGrid.innerHTML = '<div class="message">No jobs found</div>';
        return;
    }
    
    jobsGrid.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div class="job-title">${job.title}</div>
            <div class="job-category">${job.category}</div>
            <div class="job-description">${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}</div>
            <div class="job-details">
                <div class="job-budget">$${job.budget.amount} ${job.budget.type}</div>
                <div class="job-experience">${job.experience} level</div>
            </div>
            <div class="job-actions">
                <button class="btn btn-outline" onclick="viewJob('${job._id}')">View Details</button>
                ${currentUser && currentUser.role === 'freelancer' ? 
                    `<button class="btn btn-primary" onclick="applyForJob('${job._id}')">Apply Now</button>` : ''}
            </div>
        </div>
    `).join('');
}

function displayPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    
    if (pagination.total <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    if (pagination.hasPrev) {
        paginationHTML += `<button onclick="loadJobs(${pagination.current - 1})">Previous</button>`;
    }
    
    for (let i = 1; i <= pagination.total; i++) {
        if (i === pagination.current) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="loadJobs(${i})">${i}</button>`;
        }
    }
    
    if (pagination.hasNext) {
        paginationHTML += `<button onclick="loadJobs(${pagination.current + 1})">Next</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

async function viewJob(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`);
        const job = await response.json();
        
        if (response.ok) {
            displayJobModal(job);
        } else {
            showMessage('Failed to load job details', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function displayJobModal(job) {
    const modalContent = document.getElementById('job-modal-content');
    
    modalContent.innerHTML = `
        <div class="job-details-header">
            <h2 class="job-details-title">${job.title}</h2>
            <div class="job-details-meta">
                <span><i class="fas fa-briefcase"></i> ${job.category}</span>
                <span><i class="fas fa-dollar-sign"></i> $${job.budget.amount} ${job.budget.type}</span>
                <span><i class="fas fa-user"></i> ${job.experience} level</span>
                <span><i class="fas fa-clock"></i> ${job.duration || 'Not specified'}</span>
            </div>
        </div>
        <div class="job-details-description">${job.description}</div>
        ${job.skills && job.skills.length > 0 ? 
            `<div><strong>Skills:</strong> ${job.skills.join(', ')}</div>` : ''}
        ${currentUser && currentUser.role === 'freelancer' ? 
            `<button class="btn btn-primary" onclick="showApplyModal('${job._id}')">Apply for this job</button>` : ''}
    `;
    
    showModal('job-modal');
}

async function handlePostJob(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login to post a job', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const jobData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        budget: {
            type: formData.get('budget.type'),
            amount: Number(formData.get('budget.amount'))
        },
        experience: formData.get('experience'),
        duration: formData.get('duration'),
        skills: formData.get('skills').split(',').map(skill => skill.trim()).filter(skill => skill)
    };
    
    try {
        const response = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(jobData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Job posted successfully!', 'success');
            e.target.reset();
            loadJobs();
        } else {
            showMessage(data.message || 'Failed to post job', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function applyForJob(jobId) {
    if (!currentUser) {
        showMessage('Please login to apply for jobs', 'error');
        return;
    }
    
    if (currentUser.role !== 'freelancer') {
        showMessage('Only freelancers can apply for jobs', 'error');
        return;
    }
    
    showApplyModal(jobId);
}

function showApplyModal(jobId) {
    document.getElementById('apply-form').dataset.jobId = jobId;
    showModal('apply-modal');
}

async function handleApplyJob(e) {
    e.preventDefault();
    
    const jobId = e.target.dataset.jobId;
    const proposal = document.getElementById('apply-proposal').value;
    const bidAmount = Number(document.getElementById('apply-bid').value);
    const estimatedDuration = document.getElementById('apply-duration').value;
    
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                proposal,
                bidAmount,
                estimatedDuration
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Application submitted successfully!', 'success');
            closeModal('apply-modal');
            e.target.reset();
        } else {
            showMessage(data.message || 'Failed to submit application', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Search and filter functions
function handleSearch(e) {
    currentFilters.search = e.target.value;
    currentPage = 1;
    loadJobs(1);
}

function handleFilterChange() {
    const category = document.getElementById('category-filter').value;
    const experience = document.getElementById('experience-filter').value;
    
    currentFilters = {};
    if (category) currentFilters.category = category;
    if (experience) currentFilters.experience = experience;
    
    currentPage = 1;
    loadJobs(1);
}

// Utility functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load profile data
async function loadProfile() {
    if (!currentUser) {
        document.getElementById('profile-content').innerHTML = '<div class="message">Please login to view your profile</div>';
        return;
    }
    
    const profileContent = document.getElementById('profile-content');
    profileContent.innerHTML = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">${currentUser.name.charAt(0)}</div>
                <div class="profile-info">
                    <h3>${currentUser.name}</h3>
                    <p>${currentUser.email}</p>
                    <p><strong>Role:</strong> ${currentUser.role}</p>
                </div>
            </div>
            ${currentUser.profile ? `
                <div class="profile-details">
                    <p><strong>Bio:</strong> ${currentUser.profile.bio || 'No bio added'}</p>
                    <p><strong>Skills:</strong> ${currentUser.profile.skills ? currentUser.profile.skills.join(', ') : 'No skills added'}</p>
                    <p><strong>Hourly Rate:</strong> ${currentUser.profile.hourlyRate ? `$${currentUser.profile.hourlyRate}/hr` : 'Not set'}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Navigation event listeners
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        const href = e.target.getAttribute('href');
        if (href === '#profile') {
            loadProfile();
        }
    }
}); 