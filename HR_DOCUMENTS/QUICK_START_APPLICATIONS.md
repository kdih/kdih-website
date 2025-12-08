# Quick Access: Job Applications  

**How to View & Download Applications Right Now**

---

## ✅ Currently Working System

### When Applications Come In

**Email to `info@kdih.org` includes:**

- Applicant name, email, phone
- Position applied for
- Years of experience
- Full cover letter text
- **Application ID** (to reference in database)

**The CV and Portfolio files are attached to the email!**  
✅ You can download them directly from your email

---

## 📂 File Download via Database (For Tech Users)

If you need direct access to uploaded files stored on the server:

**Files are saved in:** `/uploads/` folder  
**File paths stored in database:** `job_applications` table

### To View All Applications in Database

```bash
# SSH into your server
cd /Users/yankyaure/Downloads/kdih_website\ 2/

# View all applications
sqlite3 kdih.db "SELECT id, full_name, position, email, phone, created_at, status FROM job_applications ORDER BY created_at DESC;"

# Get file paths for specific application
sqlite3 kdih.db "SELECT cv_path, portfolio_path FROM job_applications WHERE id = [APPLICATION_ID];"
```

### To Download Files via API (For Admins)

**Endpoint:** `GET /api/admin/careers/applications/:id/download/:type`

- `:id` = application ID
- `:type` = `cv` or `portfolio`

**Example:**

```
GET https://your-domain.com/api/admin/careers/applications/1/download/cv
GET https://your-domain.com/api/admin/careers/applications/1/download/portfolio
```

**Note:** You need to be logged in as admin to access these.

---

## 🎯 Recommended Simple Workflow (No Coding Needed)

1. **Check Your Email** (`info@kdih.org`)
   - New application notification arrives
   - Download CV/portfolio attachments from email
   - Save to folder: `Applications/[Position Name]/`

2. **Review Application**
   - Read cover letter in email
   - Review downloaded CV
   - Check portfolio (if included)

3. **Track in Spreadsheet**
   - Create Excel/Google Sheet
   - Columns: Application ID, Name, Position, Email, Phone, Status, Notes
   - Update after each review

4. **Respond to Candidates**
   - Reply to applicant's email directly
   - Use templates from `HR_DOCUMENTS/`

---

## 🚀 Adding Admin Dashboard Interface (Optional)

**If you want a proper web interface to manage applications:**

I can add a "Careers" tab to your admin dashboard that shows:

- Table of all applications
- Download CV/Portfolio buttons
- Status management (Pending/Reviewing/Shortlisted/Rejected/Hired)
- Add notes to each application
- Filter by position or status

**This would require:**

- Adding HTML/CSS/JavaScript to admin dashboard
- Already have the backend API ready
- Takes about 1 hour to implement

**Would you like me to add this feature?**

---

## 📊 Current Application Status

**Database Table:** `job_applications`

**Fields Stored:**

- `id` - Unique application ID
- `position` - Job position
- `full_name` - Applicant name
- `email` - Contact email
- `phone` - Phone number
- `location` - Current location
- `experience` - Years of experience
- `cover_letter` - Why they want to join
- `cv_path` - Path to uploaded CV file
- `portfolio_path` - Path to portfolio (if provided)
- `status` - Application status (default: 'pending')
- `created_at` - Application date
- `reviewed_at` - When reviewed
- `reviewed_by` - Admin who reviewed
- `notes` - Admin notes

---

## 💡 Pro Tip

**For now, the simplest approach:**

1. Set up email folder/label: "KDIH Job Applications"
2. Create email filters to automatically label incoming applications
3. Download attachments into organized folders
4. Use a simple spreadsheet to track status

**This works perfectly fine until you get many applications!**

When recruitment volume increases, we can add the admin dashboard interface for better management.

---

## ❓ Need Help?

Let me know if you:

- Want me to add the admin dashboard interface
- Need help accessing the database
- Want to modify the email notifications
- Have questions about the current system

---

**Katsina Digital Innovation Hub**  
*Simple Solutions, Professional Results*
