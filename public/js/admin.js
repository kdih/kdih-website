// Check Auth on Load
async function checkAuth() {
    try {
        const res = await fetch('/api/check-auth');
        const data = await res.json();
        if (!data.authenticated) {
            window.location.href = '/admin/login.html';
        } else {
            loadData();
        }
    } catch (err) {
        window.location.href = '/admin/login.html';
    }
}

checkAuth();

// Tab Switching
function switchTab(tabId) {
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    // Update Content
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Update Title
    document.getElementById('page-title').innerText = tabId.charAt(0).toUpperCase() + tabId.slice(1);
}

// Load Data
async function loadData() {
    loadMembers();
    loadMessages();
}

async function loadMembers() {
    try {
        const res = await fetch('/api/admin/members');
        const data = await res.json();
        const tbody = document.getElementById('members-table');
        tbody.innerHTML = '';

        if (data.data) {
            data.data.forEach(member => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${member.id}</td>
                    <td>${member.full_name}</td>
                    <td>${member.email}</td>
                    <td>${member.phone}</td>
                    <td>${member.interest}</td>
                    <td>${new Date(member.created_at).toLocaleDateString()}</td>
                    <td><button class="btn-delete" onclick="deleteMember(${member.id})">Delete</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error('Error loading members:', err);
    }
}

async function loadMessages() {
    try {
        const res = await fetch('/api/admin/messages');
        const data = await res.json();
        const tbody = document.getElementById('messages-table');
        tbody.innerHTML = '';

        if (data.data) {
            data.data.forEach(msg => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${msg.id}</td>
                    <td>${msg.name}</td>
                    <td>${msg.email}</td>
                    <td>${msg.message}</td>
                    <td>${new Date(msg.timestamp).toLocaleDateString()}</td>
                    <td><button class="btn-delete" onclick="deleteMessage(${msg.id})">Delete</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error('Error loading messages:', err);
    }
}

// Actions
async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
        const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
        if (res.ok) loadMembers();
    } catch (err) {
        alert('Error deleting member');
    }
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
        if (res.ok) loadMessages();
    } catch (err) {
        alert('Error deleting message');
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/admin/login.html';
    } catch (err) {
        console.error('Error logging out:', err);
    }
}
