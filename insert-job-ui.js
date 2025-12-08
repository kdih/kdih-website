// Refined Job UI Insertion Script - with better search patterns
const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'public/admin/dashboard.html');

console.log('🔧 Refined Job Management UI Insertion');
console.log('======================================\n');

// Read the dashboard file
let content = fs.readFileSync(dashboardPath, 'utf8');

// Create new backup
const backupPath = dashboardPath + '.backup-final-' + Date.now();
fs.writeFileSync(backupPath, content);
console.log(`✓ New backup created: ${path.basename(backupPath)}\n`);

// ========== INSERT CAREERS TAB HTML ==========
console.log('1️⃣ Inserting Careers tab HTML...');

const careersTabHTML = `
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

                <!-- Applications Section -->
                <div class="table-container">
                    <div class="table-header">
                        <h2>Job Applications</h2>
                    </div>
                    <p style="color: #64748b; padding: 2rem; text-align: center;">
                        Application management interface coming soon...
                    </p>
                </div>
            </div>

`;

// Try multiple search patterns for Services tab end
const searchPatterns = [
    '</div>\n\n        </div>\n        <!-- Modals -->',
    '</div>\n\n        </div>\n\n        <!-- Modals -->',
    '</div>\n        </div>\n        <!-- Modals -->',
    'id="services-tab" class="tab-content">',
];

let inserted = false;

// Strategy 1: Find after Services tab closes
const servicesTabMatch = content.match(/<div id="services-tab"[\s\S]*?<\/div>\s*<\/div>\s*\n/);
if (servicesTabMatch && !inserted) {
    const insertPos = servicesTabMatch.index + servicesTabMatch[0].length;
    content = content.slice(0, insertPos) + '\n' + careersTabHTML + content.slice(insertPos);
    console.log('   ✓ Careers tab inserted after Services tab\n');
    inserted = true;
}

// Strategy 2: Look for Member Details Modal and insert before it
if (!inserted) {
    const memberModalIndex = content.indexOf('<!-- Member Details Modal -->');
    if (memberModalIndex !== -1) {
        // Find the div that closes the main content just before modals
        const beforeModals = content.lastIndexOf('</div>\n\n        </div>', memberModalIndex);
        if (beforeModals !== -1) {
            const insertPos = beforeModals + '</div>\n\n        </div>'.length;
            content = content.slice(0, insertPos) + '\n' + careersTabHTML + content.slice(insertPos);
            console.log('   ✓ Careers tab inserted before modals section\n');
            inserted = true;
        }
    }
}

if (!inserted) {
    console.log('   ⚠ Could not find insertion point for Careers tab\n');
}

// ========== INSERT JOB MODAL HTML ==========
console.log('2️⃣ Inserting Job Modal HTML...');

const jobModalHTML = `
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

`;

// Find Member Details Modal and insert before it
let modalInserted = false;
const memberModalComment = content.indexOf('<!-- Member Details Modal -->');
if (memberModalComment !== -1) {
    content = content.slice(0, memberModalComment) + jobModalHTML + content.slice(memberModalComment);
    console.log('   ✓ Job Modal inserted before Member Details Modal\n');
    modalInserted = true;
}

// Fallback: Look for any modal as insertion point
if (!modalInserted) {
    const firstModal = content.indexOf('    <div id="member-details-modal"');
    if (firstModal !== -1) {
        content = content.slice(0, firstModal) + jobModalHTML + '\n' + content.slice(firstModal);
        console.log('   ✓ Job Modal inserted (fallback method)\n');
        modalInserted = true;
    }
}

if (!modalInserted) {
    console.log('   ⚠ Could not find insertion point for Job Modal\n');
}

// Write the modified content
fs.writeFileSync(dashboardPath, content);

console.log('======================================');
if (inserted && modalInserted) {
    console.log('✅ ALL COMPONENTS SUCCESSFULLY INSTALLED!\n');
} else {
    console.log('⚠️  PARTIAL INSTALLATION\n');
}

console.log('Installation Summary:');
console.log(`  - Careers tab HTML: ${inserted ? '✓ Added' : '✗ Failed'}`);
console.log(`  - Job Modal HTML: ${modalInserted ? '✓ Added' : '✗ Failed'}`);
console.log('  - CSS styles: ✓ Already added');
console.log('  - JavaScript functions: ✓ Already added\n');

if (inserted && modalInserted) {
    console.log('🎉 Job Management System is READY!\n');
    console.log('Next steps:');
    console.log('  1. Restart server if running');
    console.log('  2. Log in as super admin');
    console.log('  3. Click "Careers" tab');
    console.log('  4. Click "Create Job" to test!\n');
} else {
    console.log('⚠️  Manual intervention may be needed\n');
    console.log('Check the implementation guide in:');
    console.log('  HR_DOCUMENTS/JOB_MANAGEMENT_ADMIN_UI.md\n');
}

console.log(`Backup: ${backupPath}`);
