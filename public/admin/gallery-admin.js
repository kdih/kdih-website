/**
 * Gallery Management for Admin Dashboard
 */

let galleryData = [];
let editingGalleryId = null;

// Load gallery items for admin
async function loadGalleryAdmin() {
    const filterValue = document.getElementById('galleryFilter')?.value || 'all';

    try {
        const url = filterValue === 'all'
            ? '/api/gallery'
            : `/api/gallery?category=${filterValue}`;

        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();

        if (data.message === 'success') {
            galleryData = data.data;
            renderGalleryGrid();
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        document.getElementById('gallery-grid-admin').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="ph ph-warning" style="font-size: 3rem; opacity: 0.3;"></i>
                <p>Error loading gallery items</p>
            </div>
        `;
    }
}

// Render gallery grid
function renderGalleryGrid() {
    const grid = document.getElementById('gallery-grid-admin');
    const countEl = document.getElementById('gallery-count');

    if (countEl) countEl.textContent = galleryData.length;

    if (galleryData.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="ph ph-images" style="font-size: 3rem; opacity: 0.3;"></i>
                <p>No gallery items found</p>
                <button class="btn btn-primary" onclick="showCreateGalleryModal()" style="margin-top: 1rem;">
                    <i class="ph ph-plus"></i> Add First Image
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = galleryData.map(item => `
        <div class="gallery-admin-card" style="background: var(--primary); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
            <div style="position: relative; height: 180px; overflow: hidden;">
                <img src="${item.image_url}" alt="${item.title}" 
                     style="width: 100%; height: 100%; object-fit: cover;"
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%231e293b%22 width=%22100%22 height=%22100%22/><text fill=%22%2364748b%22 font-size=%2212%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22>No Image</text></svg>'">
                <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.5rem;">
                    <span style="background: rgba(0,0,0,0.7); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase;">
                        ${item.category}
                    </span>
                    ${item.is_featured ? '<span style="background: var(--accent); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">★ Featured</span>' : ''}
                </div>
            </div>
            <div style="padding: 1rem;">
                <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${item.title}</h4>
                <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4; margin-bottom: 1rem;">${item.description || 'No description'}</p>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editGalleryItem(${item.id})" class="btn btn-sm" style="flex: 1; padding: 0.5rem;">
                        <i class="ph ph-pencil"></i> Edit
                    </button>
                    <button onclick="deleteGalleryItem(${item.id}, '${item.title.replace(/'/g, "\\'")}')" class="btn btn-sm btn-danger" style="padding: 0.5rem;">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter gallery in admin
function filterGalleryAdmin() {
    loadGalleryAdmin();
}

// Show create modal
function showCreateGalleryModal() {
    editingGalleryId = null;
    document.getElementById('gallery-modal-title').textContent = 'Add Gallery Image';
    document.getElementById('gallery-form').reset();
    document.getElementById('gallery-image-preview').style.display = 'none';
    document.getElementById('gallery-modal').classList.add('show');
}

// Edit gallery item
async function editGalleryItem(id) {
    try {
        const response = await fetch(`/api/gallery/${id}`, { credentials: 'include' });
        const data = await response.json();

        if (data.message === 'success') {
            editingGalleryId = id;
            const item = data.data;

            document.getElementById('gallery-modal-title').textContent = 'Edit Gallery Image';
            document.getElementById('gallery-title').value = item.title;
            document.getElementById('gallery-description').value = item.description || '';
            document.getElementById('gallery-image-url').value = item.image_url;
            document.getElementById('gallery-category').value = item.category;
            document.getElementById('gallery-sort-order').value = item.sort_order;
            document.getElementById('gallery-featured').checked = item.is_featured;

            // Show preview
            const preview = document.getElementById('gallery-image-preview');
            preview.src = item.image_url;
            preview.style.display = 'block';

            document.getElementById('gallery-modal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading gallery item:', error);
        alert('Error loading gallery item');
    }
}

// Save gallery item
async function saveGalleryItem(event) {
    event.preventDefault();

    const formData = {
        title: document.getElementById('gallery-title').value,
        description: document.getElementById('gallery-description').value,
        image_url: document.getElementById('gallery-image-url').value,
        category: document.getElementById('gallery-category').value,
        sort_order: parseInt(document.getElementById('gallery-sort-order').value) || 0,
        is_featured: document.getElementById('gallery-featured').checked
    };

    try {
        const url = editingGalleryId
            ? `/api/gallery/${editingGalleryId}`
            : '/api/gallery';
        const method = editingGalleryId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.message === 'success') {
            closeModal('gallery-modal');
            loadGalleryAdmin();
            alert(editingGalleryId ? 'Gallery image updated!' : 'Gallery image added!');
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving gallery item:', error);
        alert('Error saving gallery item');
    }
}

// Delete gallery item
async function deleteGalleryItem(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
        const response = await fetch(`/api/gallery/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.message === 'success') {
            loadGalleryAdmin();
            alert('Gallery image deleted!');
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        alert('Error deleting gallery item');
    }
}

// Preview image on URL change
function previewGalleryImage() {
    const url = document.getElementById('gallery-image-url').value;
    const preview = document.getElementById('gallery-image-preview');

    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = () => {
            preview.style.display = 'none';
        };
    } else {
        preview.style.display = 'none';
    }
}

// Initialize gallery when tab is switched
document.addEventListener('DOMContentLoaded', () => {
    // Add gallery to switchTab function
    const originalSwitchTab = window.switchTab;
    window.switchTab = function (tab) {
        if (typeof originalSwitchTab === 'function') {
            originalSwitchTab(tab);
        }
        if (tab === 'gallery') {
            loadGalleryAdmin();
        }
    };
});
