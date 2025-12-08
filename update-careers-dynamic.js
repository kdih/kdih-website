// Script to update careers page for dynamic job loading
const fs = require('fs');
const path = require('path');

const careersPath = path.join(__dirname, 'public/careers.html');

console.log('🔄 Updating Careers Page for Dynamic Jobs');
console.log('==========================================\n');

let content = fs.readFileSync(careersPath, 'utf8');

// Backup
const backupPath = careersPath + '.backup-dynamic-' + Date.now();
fs.writeFileSync(backupPath, content);
console.log(`✓ Backup created\n`);

// Find the jobs-grid div and replace with dynamic container
const jobsGridStart = content.indexOf('<div class="jobs-grid" style="display: none;">');
const noOpeningsDiv = content.indexOf('<!-- No current openings message -->');

if (jobsGridStart !== -1 && noOpeningsDiv !== -1) {
    // Find where the no-openings div ends
    const noOpeningsEnd = content.indexOf('</div>', noOpeningsDiv) + '</div>'.length;

    // Replace entire section with dynamic loading container
    const newJobsSection = `<!-- Jobs will be loaded dynamically from API -->
            <div id="jobsContainer">
                <div style="text-align: center; padding: 3rem;">
                    <i class="ph ph-spinner ph-spin" style="font-size: 3rem; color: #10b981;"></i>
                    <p style="margin-top: 1rem; color: #64748b;">Loading available positions...</p>
                </div>
            </div>`;

    content = content.slice(0, jobsGridStart) + newJobsSection + content.slice(noOpeningsEnd);
    console.log('✓ Replaced static jobs section with dynamic container\n');
}

// Find the closing script tag and add dynamic loading code before it
const scriptEnd = content.lastIndexOf('</script>');
if (scriptEnd !== -1) {
    const dynamicJobsScript = `
        // ===== DYNAMIC JOB LOADING =====
        
        // Load jobs from API when page loads
        document.addEventListener('DOMContentLoaded', loadJobs);
        
        async function loadJobs() {
            try {
                const response = await fetch('/api/jobs/active');
                if (!response.ok) throw new Error('Failed to load jobs');
                
                const jobs = await response.json();
                renderJobs(jobs);
            } catch (error) {
                console.error('Error loading jobs:', error);
                showNoJobs();
            }
        }
        
        function renderJobs(jobs) {
            const container = document.getElementById('jobsContainer');
            
            if (!jobs || jobs.length === 0) {
                showNoJobs();
                return;
            }
            
            container.innerHTML = \`
                <div class="jobs-grid">
                    \${jobs.map(job => createJobCard(job)).join('')}
                </div>
            \`;
        }
        
        function createJobCard(job) {
            const responsibilities = job.responsibilities || [];
            const requirements = job.requirements || [];
            const deadline = job.application_deadline 
                ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : null;
            
            return \`
                <div class="job-card">
                    <div class="job-header">
                        <div class="job-title">
                            <h3>\${job.title}</h3>
                        </div>
                    </div>
                    <div class="job-meta">
                        <span class="meta-badge">
                            <i class="ph ph-briefcase"></i> \${formatEmploymentType(job.employment_type)}
                        </span>
                        <span class="meta-badge">
                            <i class="ph ph-map-pin"></i> \${job.location || 'Katsina, Nigeria'}
                        </span>
                        \${deadline ? \`
                            <span class="meta-badge">
                                <i class="ph ph-calendar"></i> Apply by: \${deadline}
                            </span>
                        \` : ''}
                        \${job.salary_info ? \`
                            <span class="meta-badge">
                                <i class="ph ph-currency-ngn"></i> \${job.salary_info}
                            </span>
                        \` : ''}
                    </div>
                    
                    \${job.description ? \`
                        <div class="job-section">
                            <p style="color: #64748b; line-height: 1.6;">\${job.description}</p>
                        </div>
                    \` : ''}
                    
                    \${responsibilities.length > 0 ? \`
                        <div class="job-section">
                            <h4>What You'll Do:</h4>
                            <ul>
                                \${responsibilities.map(r => \`<li>\${r}</li>\`).join('')}
                            </ul>
                        </div>
                    \` : ''}
                    
                    \${requirements.length > 0 ? \`
                        <div class="job-section">
                            <h4>What We're Looking For:</h4>
                            <ul>
                                \${requirements.map(r => \`<li>\${r}</li>\`).join('')}
                            </ul>
                        </div>
                    \` : ''}
                    
                    <div class="job-actions">
                        <button onclick="openApplicationModal('\${job.title}')" class="apply-btn" style="background: #10b981; color: white; padding: 0.75rem 2rem; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.3s;">
                            <i class="ph-fill ph-paper-plane"></i> Apply Now
                        </button>
                    </div>
                </div>
            \`;
        }
        
        function formatEmploymentType(type) {
            const types = {
                'full-time': 'Full-time',
                'part-time': 'Part-time',
                'contract': 'Contract'
            };
            return types[type] || type;
        }
        
        function showNoJobs() {
            const container = document.getElementById('jobsContainer');
            container.innerHTML = \`
                <div style="text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                                width: 100px; height: 100px; border-radius: 50%; 
                                display: flex; align-items: center; justify-content: center; 
                                margin: 0 auto 2rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
                        <i class="ph ph-briefcase" style="font-size: 3rem; color: white;"></i>
                    </div>
                    <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #1e293b;">No Current Openings</h2>
                    <p style="color: #64748b; font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem;">
                        We don't have any open positions at the moment, but we're always interested in 
                        hearing from talented individuals. Feel free to send your CV to our email below 
                        for future opportunities.
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center;">
                        <a href="mailto:info@kdih.org" style="color: #10b981; font-weight: 500; text-decoration: none; 
                                                               font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph-fill ph-envelope"></i> info@kdih.org
                        </a>
                        <a href="mailto:katsinadigitalhub@gmail.com" style="color: #10b981; font-weight: 500; 
                                                                             text-decoration: none; font-size: 1.1rem; 
                                                                             display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph-fill ph-envelope"></i> katsinadigitalhub@gmail.com
                        </a>
                    </div>
                </div>
            \`;
        }
        
    `;

    content = content.slice(0, scriptEnd) + dynamicJobsScript + content.slice(scriptEnd);
    console.log('✓ Added dynamic job loading JavaScript\n');
}

fs.writeFileSync(careersPath, content);

console.log('==========================================');
console.log('✅ Careers Page Updated for Dynamic Jobs!\n');
console.log('Changes:');
console.log('  - Removed static job listings');
console.log('  - Added dynamic loading container');
console.log('  - Added fetch from /api/jobs/active');
console.log('  - Added dynamic job card generation');
console.log('  - Added formatted "no jobs" message\n');
console.log('Result:');
console.log('  - Active jobs will display automatically');
console.log('  - When no jobs: shows contact emails');
console.log('  - Application form still works!\n');
console.log(`Backup: ${path.basename(backupPath)}`);
