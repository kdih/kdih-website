/**
 * Certificate Management for Admin Dashboard
 * With Multi-Step Approval Workflow:
 * 1. Admin initiates certificate request (status: pending)
 * 2. Finance confirms payment (status: finance_confirmed)
 * 3. Super Admin approves (status: approved, certificate is issued)
 */

let certificatesData = [];
let currentUserRole = null;

// Initialize user role
function initCertificateAdmin() {
    // Get current user role from session
    fetch('/api/check-session')
        .then(res => res.json())
        .then(data => {
            if (data.authenticated) {
                currentUserRole = data.user.role;
            }
        });
}

// Call on page load
initCertificateAdmin();

// Load certificates from API
async function loadCertificates() {
    try {
        const response = await fetch('/api/admin/certificates');
        const data = await response.json();

        if (data.message === 'success') {
            certificatesData = data.data || [];
            renderCertificatesTable();
            updateCertificateStats(data.stats || {});
            populateCourseFilter();
        } else {
            console.error('Failed to load certificates:', data.error);
            showCertificateError('Failed to load certificates');
        }
    } catch (error) {
        console.error('Error loading certificates:', error);
        showCertificateError('Error loading certificates');
    }
}

function showCertificateError(message) {
    document.getElementById('certificates-list').innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">
                <i class="ph ph-warning"></i>
                <p>${message}</p>
            </td>
        </tr>`;
}

// Update certificate stats
function updateCertificateStats(stats) {
    document.getElementById('cert-total').textContent = stats.total || 0;
    document.getElementById('cert-this-month').textContent = stats.thisMonth || 0;
    document.getElementById('cert-this-year').textContent = stats.thisYear || 0;
}

// Populate course filter dropdown
function populateCourseFilter() {
    const courses = [...new Set(certificatesData.map(c => c.course_title))];
    const filter = document.getElementById('cert-course-filter');

    if (filter) {
        filter.innerHTML = '<option value="">All Courses</option>';
        courses.forEach(course => {
            filter.innerHTML += `<option value="${course}">${course}</option>`;
        });
    }
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusConfig = {
        pending: { label: 'Pending Finance', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        finance_confirmed: { label: 'Awaiting Approval', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        approved: { label: 'Approved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return `<span class="status-badge" style="background: ${config.bg}; color: ${config.color}; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500;">${config.label}</span>`;
}

// Get action buttons based on status and user role
function getActionButtons(cert) {
    let buttons = [];

    // View button (always available for approved certs)
    if (cert.status === 'approved') {
        buttons.push(`<button class="btn btn-sm" onclick="viewCertificate('${cert.verification_code}')" title="View Certificate"><i class="ph ph-eye"></i></button>`);
        buttons.push(`<button class="btn btn-sm" onclick="copyCertificateLink('${cert.verification_code}')" title="Copy Link"><i class="ph ph-copy"></i></button>`);
    }

    // Finance confirm button (for finance and super_admin when status is pending)
    if (cert.status === 'pending' && (currentUserRole === 'finance' || currentUserRole === 'super_admin')) {
        buttons.push(`<button class="btn btn-sm btn-success" onclick="confirmFinance(${cert.id})" title="Confirm Payment" style="background: #10b981; color: white;"><i class="ph ph-check"></i> Finance</button>`);
    }

    // Approve button (only for super_admin when status is finance_confirmed)
    if (cert.status === 'finance_confirmed' && currentUserRole === 'super_admin') {
        buttons.push(`<button class="btn btn-sm btn-success" onclick="approveCertificate(${cert.id})" title="Approve" style="background: #10b981; color: white;"><i class="ph ph-check-circle"></i> Approve</button>`);
    }

    // Reject button (for finance_confirmed status, super_admin only)
    if ((cert.status === 'pending' || cert.status === 'finance_confirmed') && currentUserRole === 'super_admin') {
        buttons.push(`<button class="btn btn-sm btn-danger" onclick="rejectCertificate(${cert.id}, '${cert.student_name}')" title="Reject" style="background: #ef4444; color: white;"><i class="ph ph-x"></i></button>`);
    }

    // Delete button (super_admin only)
    if (currentUserRole === 'super_admin') {
        buttons.push(`<button class="btn btn-sm" onclick="deleteCertificate(${cert.id}, '${cert.student_name}')" title="Delete" style="color: #ef4444;"><i class="ph ph-trash"></i></button>`);
    }

    return buttons.length > 0 ? buttons.join('') : '<span style="color: var(--text-muted);">-</span>';
}

// Render certificates table
function renderCertificatesTable() {
    const tbody = document.getElementById('certificates-list');

    if (!tbody) return;

    if (certificatesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="ph ph-certificate"></i>
                    <p>No certificates found</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = certificatesData.map(cert => {
        const issueDate = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : '-';

        const certNumber = cert.status === 'approved' && cert.certificate_number
            ? cert.certificate_number
            : '<span style="color: var(--text-muted);">Pending approval</span>';

        return `
            <tr>
                <td style="font-family: monospace; font-size: 0.85rem;">${certNumber}</td>
                <td>${cert.student_name}</td>
                <td>${cert.course_title}</td>
                <td><span class="status-badge type-${(cert.certificate_type || 'completion').toLowerCase()}">${cert.certificate_type || 'Completion'}</span></td>
                <td>${getStatusBadge(cert.status)}</td>
                <td>${issueDate}</td>
                <td style="font-family: monospace; font-size: 0.8rem;">${cert.verification_code || '-'}</td>
                <td>
                    <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                        ${getActionButtons(cert)}
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// Filter certificates
function filterCertificates() {
    const searchTerm = document.getElementById('cert-search')?.value.toLowerCase() || '';
    const courseFilter = document.getElementById('cert-course-filter')?.value || '';
    const statusFilter = document.getElementById('cert-status-filter')?.value || '';

    const filtered = certificatesData.filter(cert => {
        const matchesSearch =
            cert.student_name.toLowerCase().includes(searchTerm) ||
            (cert.certificate_number || '').toLowerCase().includes(searchTerm) ||
            (cert.verification_code || '').toLowerCase().includes(searchTerm);

        const matchesCourse = !courseFilter || cert.course_title === courseFilter;
        const matchesStatus = !statusFilter || cert.status === statusFilter;

        return matchesSearch && matchesCourse && matchesStatus;
    });

    // Temporarily replace data for rendering
    const originalData = certificatesData;
    certificatesData = filtered;
    renderCertificatesTable();
    certificatesData = originalData;
}

// Issue certificate form handler (initiates request, doesn't finalize)
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('issue-certificate-form');
    if (form) {
        form.addEventListener('submit', handleCertificateSubmit);
    }
});

async function handleCertificateSubmit(e) {
    e.preventDefault();

    const studentName = document.getElementById('cert-student-name').value.trim();
    const studentEmail = document.getElementById('cert-student-email').value.trim();
    const courseTitle = document.getElementById('cert-course').value;
    const certificateType = document.getElementById('cert-type').value;

    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    try {
        btn.innerHTML = '<i class="ph-fill ph-spinner" style="animation: spin 1s linear infinite;"></i> Submitting...';
        btn.disabled = true;

        const response = await fetch('/api/admin/certificates/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_name: studentName,
                student_email: studentEmail,
                course_title: courseTitle,
                certificate_type: certificateType
            })
        });

        const data = await response.json();

        if (data.message === 'success') {
            // Show success message
            alert(`Certificate request initiated for ${studentName}.\n\nNext step: Finance needs to confirm payment.`);

            // Reset form
            this.reset();

            // Reload certificates list
            loadCertificates();

        } else {
            alert('Failed to initiate certificate: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error initiating certificate:', error);
        alert('Error initiating certificate. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Finance confirm payment
async function confirmFinance(id) {
    if (!confirm('Confirm that payment has been received for this certificate?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/certificates/${id}/confirm-finance`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.message === 'success') {
            alert('Payment confirmed! Certificate is now awaiting super admin approval.');
            loadCertificates();
        } else {
            alert('Failed to confirm: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        alert('Error confirming payment. Please try again.');
    }
}

// Super admin approve certificate
async function approveCertificate(id) {
    if (!confirm('Approve this certificate? This will generate the official certificate number.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/certificates/${id}/approve`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.message === 'success') {
            // Show the result
            document.getElementById('result-cert-number').textContent = data.certificate_number;
            document.getElementById('result-verify-code').textContent = data.verification_code;
            document.getElementById('result-student-name').textContent = data.student_name;
            document.getElementById('result-course').textContent = data.course_title;

            const verifyUrl = `${window.location.origin}/verify-certificate.html?code=${encodeURIComponent(data.verification_code)}`;
            document.getElementById('result-verify-url').textContent = verifyUrl;
            document.getElementById('result-verify-url').href = verifyUrl;

            document.getElementById('certificate-result').style.display = 'block';

            loadCertificates();
        } else {
            alert('Failed to approve: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error approving certificate:', error);
        alert('Error approving certificate. Please try again.');
    }
}

// Reject certificate
async function rejectCertificate(id, studentName) {
    const reason = prompt(`Reason for rejecting certificate for "${studentName}":`);
    if (reason === null) return; // Cancelled

    try {
        const response = await fetch(`/api/admin/certificates/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (data.message === 'success') {
            alert('Certificate request rejected.');
            loadCertificates();
        } else {
            alert('Failed to reject: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error rejecting certificate:', error);
        alert('Error rejecting certificate. Please try again.');
    }
}

// View certificate in verification page
function viewCertificate(verificationCode) {
    window.open(`/verify-certificate.html?code=${encodeURIComponent(verificationCode)}`, '_blank');
}

// Copy verification link
function copyCertificateLink(verificationCode) {
    const url = `${window.location.origin}/verify-certificate.html?code=${encodeURIComponent(verificationCode)}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Verification link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        prompt('Copy this link:', url);
    });
}

// Delete certificate
async function deleteCertificate(id, studentName) {
    if (!confirm(`Are you sure you want to delete the certificate for "${studentName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/certificates/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.message === 'success') {
            loadCertificates();
        } else {
            alert('Failed to delete certificate: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting certificate:', error);
        alert('Error deleting certificate. Please try again.');
    }
}

// Add spinner animation style
if (!document.getElementById('cert-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'cert-spinner-style';
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .type-completion { background: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; }
        .type-excellence { background: rgba(245, 158, 11, 0.1); color: #d97706; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; }
        .type-participation { background: rgba(16, 185, 129, 0.1); color: #059669; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; }
    `;
    document.head.appendChild(style);
}
