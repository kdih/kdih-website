# Job Management Admin UI - Implementation Guide

This document contains the HTML/CSS/JavaScript to add to the admin dashboard for job management.

## 1. Add Careers Tab Content (After line ~1036 in admin/dashboard.html)

Insert this after the Services Tab, before the closing of main content:

```html
<!-- Careers Tab -->
<div id="careers-tab" class="tab-content">
    <!-- Job Postings Section -->
    <div class="table-container" style="margin-bottom: 3rem;">
        <div class="table-header">
            <h2>Job Postings</h2>
            <div style="display: flex; gap: 1rem;">
                <select id="jobStatusFilter" onchange="filterJobs()" style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                </select>
                <button class="btn" onclick="showCreateJobModal()">
                    <i class="ph-fill ph-plus"></i> Create Job
                </button>
            </div>
        </div>
        <table id="jobsTable">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Applications</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="jobsTableBody">
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="ph ph-spinner ph-spin" style="font-size: 2rem;"></i>
                        <p>Loading jobs...</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Applications Section (Existing - will add later) -->
    <div class="table-container">
        <div class="table-header">
            <h2>Job Applications</h2>
        </div>
        <p style="color: #64748b; padding: 2rem; text-align: center;">
            Application management interface coming soon...
        </p>
    </div>
</div>

<!-- Job Form Modal -->
<div id="jobModal" class="modal">
    <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
            <h2 id="jobModalTitle">Create Job Posting</h2>
            <button class="close-btn" onclick="closeJobModal()">&times;</button>
        </div>
        <form id="jobForm" onsubmit="saveJob(event)">
            <input type="hidden" id="jobId" name="id">
            
            <div class="form-row" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="jobTitle">Job Title *</label>
                    <input type="text" id="jobTitle" name="title" required>
                </div>
                <div class="form-group">
                    <label for="jobDepartment">Department</label>
                    <input type="text" id="jobDepartment" name="department" placeholder="e.g., Operations">
                </div>
            </div>

            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="jobType">Employment Type *</label>
                    <select id="jobType" name="employment_type" required>
                        <option value="">Select...</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="jobLocation">Location</label>
                    <input type="text" id="jobLocation" name="location" value="Katsina, Nigeria">
                </div>
                <div class="form-group">
                    <label for="jobSalary">Salary Info</label>
                    <input type="text" id="jobSalary" name="salary_info" placeholder="e.g., Competitive">
                </div>
            </div>

            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="jobDeadline">Application Deadline</label>
                    <input type="date" id="jobDeadline" name="application_deadline">
                </div>
                <div class="form-group">
                    <label for="jobStatus">Status *</label>
                    <select id="jobStatus" name="status" required>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="jobDescription">Job Description</label>
                <textarea id="jobDescription" name="description" rows="4" placeholder="Describe the role..."></textarea>
            </div>

            <div class="form-group">
                <label>Responsibilities</label>
                <div id="responsibilitiesList"></div>
                <button type="button" onclick="addListItem('responsibilities')" class="btn-secondary" style="margin-top: 0.5rem;">
                    <i class="ph ph-plus"></i> Add Responsibility
                </button>
            </div>

            <div class="form-group">
                <label>Requirements</label>
                <div id="requirementsList"></div>
                <button type="button" onclick="addListItem('requirements')" class="btn-secondary" style="margin-top: 0.5rem;">
                    <i class="ph ph-plus"></i> Add Requirement
                </button>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" onclick="closeJobModal()" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn">
                    <i class="ph ph-check"></i> <span id="jobSubmitText">Create Job</span>
                </button>
            </div>
        </form>
    </div>
</div>
```

## 2. Add JavaScript Functions (Before closing </script> tag, around line 3200+)

```javascript
// ===== JOB MANAGEMENT =====

let currentJobs = [];
let editingJobId = null;

// Load all jobs
async function loadJobs() {
    try {
        const response = await fetch('/api/admin/jobs');
        if (!response.ok) throw new Error('Failed to load jobs');
        
        currentJobs = await response.json();
        renderJobsTable();
    } catch (error) {
        console.error('Error loading jobs:', error);
        showNotification('Failed to load jobs', 'error');
    }
}

// Render jobs table
function renderJobsTable() {
    const tbody = document.getElementById('jobsTableBody');
    const filter = document.getElementById('jobStatusFilter')?.value || 'all';
    
    const filteredJobs = filter === 'all' 
        ? currentJobs 
        : currentJobs.filter(job => job.status === filter);
    
    if (filteredJobs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
                    No jobs found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredJobs.map(job => `
        <tr>
            <td><strong>${job.title}</strong></td>
            <td>${job.department || '-'}</td>
            <td>${formatEmploymentType(job.employment_type)}</td>
            <td>
                <span class="status-badge status-${job.status}">
                    ${job.status}
                </span>
            </td>
            <td>${job.applications_count || 0}</td>
            <td>${new Date(job.created_at).toLocaleDateString()}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editJob(${job.id})" class="btn-icon" title="Edit">
                        <i class="ph ph-pencil"></i>
                    </button>
                    <button onclick="toggleJobStatus(${job.id}, '${job.status}')" 
                            class="btn-icon" title="Toggle Status">
                        <i class="ph ph-${job.status === 'active' ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button onclick="deleteJob(${job.id}, '${job.title.replace(/'/g, "\\'")}  ')" 
                            class="btn-icon btn-danger" title="Delete">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterJobs() {
    renderJobsTable();
}

function formatEmploymentType(type) {
    const types = {
        'full-time': 'Full-time',
        'part-time': 'Part-time',
        'contract': 'Contract'
    };
    return types[type] || type;
}

// Show create job modal
function showCreateJobModal() {
    editingJobId = null;
    document.getElementById('jobModalTitle').textContent = 'Create Job Posting';
    document.getElementById('jobSubmitText').textContent = 'Create Job';
    document.getElementById('jobForm').reset();
    document.getElementById('jobId').value = '';
    
    // Clear dynamic lists
    document.getElementById('responsibilitiesList').innerHTML = '';
    document.getElementById('requirementsList').innerHTML = '';
    
    // Add one empty field for each
    addListItem('responsibilities');
    addListItem('requirements');
    
    document.getElementById('jobModal').classList.add('active');
}

// Edit job
async function editJob(jobId) {
    try {
        const response = await fetch(`/api/admin/jobs/${jobId}`);
        if (!response.ok) throw new Error('Failed to load job');
        
        const job = await response.json();
        editingJobId = jobId;
        
        document.getElementById('jobModalTitle').textContent = 'Edit Job Posting';
        document.getElementById('jobSubmitText').textContent = 'Update Job';
        document.getElementById('jobId').value = job.id;
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobDepartment').value = job.department || '';
        document.getElementById('jobType').value = job.employment_type;
        document.getElementById('jobLocation').value = job.location;
        document.getElementById('jobSalary').value = job.salary_info || '';
        document.getElementById('jobDeadline').value = job.application_deadline || '';
        document.getElementById('jobStatus').value = job.status;
        document.getElementById('jobDescription').value = job.description || '';
        
        // Populate responsibilities
        const respList = document.getElementById('responsibilitiesList');
        respList.innerHTML = '';
        (job.responsibilities || []).forEach(item => {
            addListItem('responsibilities', item);
        });
        if (job.responsibilities.length === 0) addListItem('responsibilities');
        
        // Populate requirements
        const reqList = document.getElementById('requirementsList');
        reqList.innerHTML = '';
        (job.requirements || []).forEach(item => {
            addListItem('requirements', item);
        });
        if (job.requirements.length === 0) addListItem('requirements');
        
        document.getElementById('jobModal').classList.add('active');
    } catch (error) {
        console.error('Error loading job:', error);
        showNotification('Failed to load job details', 'error');
    }
}

// Add dynamic list item
function addListItem(listType, value = '') {
    const listId = listType === 'responsibilities' ? 'responsibilitiesList' : 'requirementsList';
    const list = document.getElementById(listId);
    
    const item = document.createElement('div');
    item.className = 'list-item-input';
    item.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';
    item.innerHTML = `
        <input type="text" 
               class="${listType}-item" 
               value="${value}" 
               placeholder="Enter ${listType === 'responsibilities' ? 'responsibility' : 'requirement'}..."
               style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" 
                onclick="this.parentElement.remove()" 
                class="btn-icon btn-danger"
                title="Remove">
            <i class="ph ph-x"></i>
        </button>
    `;
    list.appendChild(item);
}

// Save job (create or update)
async function saveJob(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Collect responsibilities
    const responsibilities = Array.from(document.querySelectorAll('.responsibilities-item'))
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    // Collect requirements
    const requirements = Array.from(document.querySelectorAll('.requirements-item'))
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    const jobData = {
        title: formData.get('title'),
        department: formData.get('department'),
        employment_type: formData.get('employment_type'),
        location: formData.get('location'),
        salary_info: formData.get('salary_info'),
        application_deadline: formData.get('application_deadline'),
        description: formData.get('description'),
        responsibilities,
        requirements,
        status: formData.get('status')
    };
    
    try {
        const url = editingJobId 
            ? `/api/admin/jobs/${editingJobId}`
            : '/api/admin/jobs';
        const method = editingJobId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
        
        if (!response.ok) throw new Error('Failed to save job');
        
        const result = await response.json();
        showNotification(result.message || 'Job saved successfully', 'success');
        
        closeJobModal();
        loadJobs();
    } catch (error) {
        console.error('Error saving job:', error);
        showNotification('Failed to save job', 'error');
    }
}

// Toggle job status (quick publish/unpublish)
async function toggleJobStatus(jobId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const job = currentJobs.find(j => j.id === jobId);
    
    if (!job) return;
    
    try {
        const response = await fetch(`/api/admin/jobs/${jobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...job, status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update status');
        
        showNotification(`Job ${newStatus === 'active' ? 'published' : 'unpublished'}`, 'success');
        loadJobs();
    } catch (error) {
        console.error('Error toggling status:', error);
        showNotification('Failed to update status', 'error');
    }
}

// Delete job
async function deleteJob(jobId, jobTitle) {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/jobs/${jobId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete job');
        
        showNotification('Job deleted successfully', 'success');
        loadJobs();
    } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('Failed to delete job', 'error');
    }
}

// Close job modal
function closeJobModal() {
    document.getElementById('jobModal').classList.remove('active');
    editingJobId = null;
}

// Update switchTab function to load jobs when careers tab is opened
const originalSwitchTab = switchTab;
switchTab = function(tabName) {
    originalSwitchTab(tabName);
    if (tabName === 'careers') {
        loadJobs();
    }
};
```

## 3. Add CSS Styles (In <style> section)

```css
/* Status badges */
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: capitalize;
}

.status-draft {
    background: #f1f5f9;
    color: #64748b;
}

.status-active {
    background: #dcfce7;
    color: #16a34a;
}

.status-closed {
    background: #fee2e2;
    color: #dc2626;
}

/* Button icons */
.btn-icon {
    padding: 0.5rem;
    border: none;
    background: #f1f5f9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #e2e8f0;
}

.btn-icon.btn-danger {
    background: #fee2e2;
    color: #dc2626;
}

.btn-icon.btn-danger:hover {
    background: #fecaca;
}

.btn-secondary {
    padding: 0.5rem 1rem;
    border: 1px solid #cbd5e1;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-secondary:hover {
    background: #f8fafc;
    border-color: #94a3b8;
}
```

---

## Implementation Steps

1. Add the Careers tab HTML after the Services tab section
2. Add the JavaScript functions before the closing script tag
3. Add the CSS styles in the style section
4. Test by logging in as super admin and going to Careers tab
