// Admin Dashboard - Edit & Delete Functions

// ===== COURSE MANAGEMENT =====

async function editCourse(courseId) {
    try {
        // Fetch course data
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        if (data.message === 'success') {
            const course = data.data;

            // Populate edit form
            const form = document.getElementById('edit-course-form');
            form.querySelector('input[name="id"]').value = course.id;
            form.querySelector('input[name="title"]').value = course.title;
            form.querySelector('textarea[name="description"]').value = course.description;
            form.querySelector('select[name="track"]').value = course.track;
            form.querySelector('input[name="duration_weeks"]').value = course.duration_weeks;
            form.querySelector('input[name="price"]').value = course.price;
            form.querySelector('select[name="status"]').value = course.status;
            form.querySelector('input[name="thumbnail_url"]').value = course.thumbnail_url || '';

            // Show modal
            document.getElementById('edit-course-modal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading course:', error);
        alert('Failed to load course data');
    }
}

async function deleteCourse(courseId, courseTitle) {
    if (!confirm(`Are you sure you want to delete the course "${courseTitle}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.message === 'success') {
            alert('Course deleted successfully!');
            loadCourses(); // Refresh the courses list
        } else {
            alert('Failed to delete course: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course');
    }
}

// Handle edit course form submission
async function handleEditCourse(e) {
    e.preventDefault();
    console.log('Submitting edit course form...');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const courseId = formData.get('id');

    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        track: formData.get('track'),
        duration_weeks: parseInt(formData.get('duration_weeks')),
        price: parseFloat(formData.get('price')),
        status: formData.get('status'),
        thumbnail_url: formData.get('thumbnail_url')
    };

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status, 'OK:', response.ok);
        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok && result.message === 'success') {
            alert('Course updated successfully!');
            closeModal('edit-course-modal');
            loadCourses(); // Refresh the courses list
        } else {
            alert('Failed to update course: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating course:', error);
        alert('Failed to update course');
    }
}

// ===== EVENT MANAGEMENT =====

async function editEvent(eventId) {
    console.log('Editing event:', eventId);
    try {
        // Fetch event data
        const response = await fetch(`/api/events`);
        const data = await response.json();

        if (data.message === 'success') {
            // Ensure type safety for ID comparison
            const event = data.data.find(e => e.id == eventId);

            if (!event) {
                console.error('Event not found for ID:', eventId);
                alert('Event not found');
                return;
            }

            // Populate edit form
            const form = document.getElementById('edit-event-form');
            form.querySelector('input[name="id"]').value = event.id;
            form.querySelector('input[name="title"]').value = event.title;
            form.querySelector('textarea[name="description"]').value = event.description;
            form.querySelector('select[name="event_type"]').value = event.event_type;

            // Format datetime for datetime-local input
            const eventDate = new Date(event.event_date);
            const endDate = new Date(event.end_date);
            form.querySelector('input[name="event_date"]').value = formatDateTimeLocal(eventDate);
            form.querySelector('input[name="end_date"]').value = formatDateTimeLocal(endDate);

            form.querySelector('input[name="location"]').value = event.location;
            form.querySelector('input[name="max_attendees"]').value = event.max_attendees;
            form.querySelector('input[name="price"]').value = event.price;
            form.querySelector('select[name="status"]').value = event.status;
            form.querySelector('input[name="thumbnail_url"]').value = event.thumbnail_url || '';

            // Show modal
            document.getElementById('edit-event-modal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading event:', error);
        alert('Failed to load event data');
    }
}

async function deleteEvent(eventId, eventTitle) {
    if (!confirm(`Are you sure you want to delete the event "${eventTitle}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.message === 'success') {
            alert('Event deleted successfully!');
            loadEvents(); // Refresh the events list
        } else {
            alert('Failed to delete event: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
    }
}

// Handle edit event form submission
async function handleEditEvent(e) {
    e.preventDefault();
    console.log('Submitting edit event form...');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const eventId = formData.get('id');

    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        event_type: formData.get('event_type'),
        event_date: formData.get('event_date'),
        end_date: formData.get('end_date'),
        location: formData.get('location'),
        max_attendees: parseInt(formData.get('max_attendees')),
        price: parseFloat(formData.get('price')),
        status: formData.get('status'),
        thumbnail_url: formData.get('thumbnail_url')
    };

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.message === 'success') {
            alert('Event updated successfully!');
            closeModal('edit-event-modal');
            loadEvents(); // Refresh the events list
        } else {
            alert('Failed to update event: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Failed to update event');
    }
}

// ===== HELPER FUNCTIONS =====

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ===== SERVICE MANAGEMENT =====

async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const data = await response.json();

        const list = document.getElementById('services-list');
        if (data.data && data.data.length > 0) {
            list.innerHTML = data.data.map(service => `
                <tr>
                    <td><i class="${service.icon}" style="font-size: 1.5rem; color: var(--accent);"></i></td>
                    <td>${service.title}</td>
                    <td>${service.description}</td>
                    <td>
                        <button class="btn btn-sm" onclick="editService(${service.id})">
                            <i class="ph-fill ph-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id}, '${service.title.replace(/'/g, "\\'")}')">
                            <i class="ph-fill ph-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            list.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="ph ph-briefcase"></i><p>No services found</p></td></tr>';
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

function showCreateServiceModal() {
    document.getElementById('create-service-modal').classList.add('show');
}

async function editService(serviceId) {
    try {
        const response = await fetch('/api/services');
        const data = await response.json();

        if (data.message === 'success') {
            const service = data.data.find(s => s.id == serviceId);

            if (!service) {
                alert('Service not found');
                return;
            }

            // Populate edit form
            const form = document.getElementById('edit-service-form');
            form.querySelector('input[name="id"]').value = service.id;
            form.querySelector('input[name="icon"]').value = service.icon;
            form.querySelector('input[name="title"]').value = service.title;
            form.querySelector('textarea[name="description"]').value = service.description;

            // Show modal
            document.getElementById('edit-service-modal').classList.add('show');
        }
    } catch (error) {
        console.error('Error loading service:', error);
        alert('Failed to load service data');
    }
}

async function deleteService(serviceId, serviceTitle) {
    if (!confirm(`Are you sure you want to delete the service "${serviceTitle}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.message === 'success') {
            alert('Service deleted successfully!');
            loadServices(); // Refresh the services list
        } else {
            alert('Failed to delete service: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
    }
}

// Handle create service form submission
async function handleCreateService(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
        icon: formData.get('icon'),
        title: formData.get('title'),
        description: formData.get('description')
    };

    try {
        const response = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.message === 'success') {
            alert('Service created successfully!');
            closeModal('create-service-modal');
            form.reset();
            loadServices(); // Refresh the services list
        } else {
            alert('Failed to create service: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating service:', error);
        alert('Failed to create service');
    }
}

// Handle edit service form submission
async function handleEditService(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const serviceId = formData.get('id');

    const data = {
        icon: formData.get('icon'),
        title: formData.get('title'),
        description: formData.get('description')
    };

    try {
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.message === 'success') {
            alert('Service updated successfully!');
            closeModal('edit-service-modal');
            loadServices(); // Refresh the services list
        } else {
            alert('Failed to update service: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating service:', error);
        alert('Failed to update service');
    }
}
