# KDIH Admin Procedures Manual
**For Admin Staff Use Only**

---

## 🔐 Admin Access

### Login
**URL:** [Your Website]/admin/login.html

**Credentials:**
- **Super Admin:** superadmin / superadmin123 (CHANGE IMMEDIATELY!)
- **Admin:** Assigned by Super Admin

### First Login Tasks
1. Change default password immediately
2. Familiarize yourself with dashboard
3. Review pending items
4. Check analytics

---

## 👥 User Management

### Creating New Admin Users (Super Admin Only)
1. Login as Super Admin
2. Navigate to **Admin Management**
3. Click **"Create New Admin"**
4. Fill in:
   - Username
   - Email
   - Password (temporary)
5. Admin receives welcome email
6. They must change password on first login

### Quick Add Member (Walk-In Customers)
1. Go to **Members** → **Quick Add**
2. Enter:
   - Full Name
   - Email
   - Phone
   - Member Type (student/coworking/both)
3. System generates temporary password
4. Member receives welcome email with credentials
5. Give them their member ID

### View Member Details
1. Search for member by email/name
2. Click on member name
3. View:
   - Personal information
   - Enrollment history
   - Payment history
   - Booking history
   - Progress tracking

---

## 💰 Payment Management

### Recording Manual Payments
**Use for:** Cash, bank transfer, or offline payments

1. Navigate to **Payments** → **Record Manual Payment**
2. Enter:
   - Member email
   - Amount
   - Payment method (cash/bank transfer)
   - Payment for (course/membership/desk)
   - Notes (optional)
3. System generates reference number
4. Member account updated automatically
5. Receipt can be printed/emailed

### Verifying Online Payments
1. Dashboard shows recent payments
2. Check **Payment Status** column
3. Green = Success, Red = Failed, Yellow = Pending
4. Click to view payment details
5. Verify reference number matches bank statement

### Handling Failed Payments
1. Contact member about failed payment
2. Suggest retry or alternative method
3. If persistent, record manual payment
4. Update notes with reason

### Refund Processing
1. Verify refund request legitimacy
2. Check original payment reference
3. Process through payment gateway (Paystack)
4. OR issue cash/bank refund
5. Record in notes
6. Send confirmation to member

---

## 📚 Course Management

### Adding New Courses
1. Navigate to **Courses** → **Add New**
2. Fill in:
   - Course Title
   - Description
   - Duration (in weeks)
   - Fee
   - Start Date
   - Instructor
   - Capacity
3. Upload course image (optional)
4. Publish

### Managing Enrollments
1. View all course enrollments
2. Filter by:
   - Course
   - Payment status
   - Date range
3. Export to Excel for reporting

### Issuing Certificates
1. Navigate to **Certificates**
2. Select completed course
3. Choose student
4. Generate certificate
5. System auto-emails to student
6. Certificate stored in database

### Certificate Verification
- Members can verify at /verify-certificate.html
- Enter certificate number
- System validates against database

---

## 🏢 Coworking Space Management

### Desk Assignment (Walk-Ins)
1. Go to **Coworking** → **Assign Desk**
2. Enter member code OR create quick member
3. Select:
   - Desk number
   - Desk type
   - Date
4. Click **Assign**
5. Member checked in automatically

### Check-In / Check-Out
**Check-In:**
1. Member arrives and shows ID/code
2. Search member in system
3. Click **"Check In"**
4. Note arrival time

**Check-Out:**
1. Member ready to leave
2. Find active booking
3. Click **"Check Out"**
4. Note departure time
5. System updates booking status

### Managing Desk Availability
1. View **Desk Calendar**
2. See all bookings by date
3. Identify available desks
4. Block desks for maintenance (if needed)

### Handling Expired Memberships
1. Dashboard shows expiring memberships (7-day warning)
2. Contact member for renewal
3. Process renewal payment
4. Update membership end date
5. New membership code issued

### Canceling Bookings (Admin Override)
1. Find booking in system
2. Click **"Cancel Booking"**
3. Add reason in notes
4. System sends cancellation email (if time allows)
5. Refund if applicable

---

## 📊 Analytics & Reporting

### Viewing Analytics Dashboard
1. Click **Analytics** tab
2. View widgets:
   - Total Revenue
   - Active Members
   - Course Enrollments
   - Average Course Rating
   - Desk Occupancy
   - Revenue Trends

3. Use Date Filters:
   - 7 Days
   - 30 Days
   - 90 Days
   - 1 Year

### Generating Reports
**Revenue Report:**
1. Go to Analytics
2. Select date range
3. View revenue chart
4. Export data (if needed)

**Enrollment Statistics:**
1. View user growth chart
2. See course completion rates
3. Identify popular courses

**Desk Utilization:**
1. Check desk booking trends
2. Peak hours/days identified
3. Optimize desk allocation

### Exporting Data
1. Most tables have **Export** button
2. Downloads as CSV
3. Open in Excel for analysis

---

## 💾 Backup & Data Management

### Creating Manual Backups
1. Navigate to **Backups** tab
2. Click **"Create Backup Now"**
3. Wait for confirmation
4. Backup stored automatically
5. Displays in backup list

### Downloading Backups
1. Go to Backups list
2. Find desired backup by date
3. Click **"Download"** button
4. Save file securely (off-site storage recommended)

### Restoring from Backup
⚠️ **CAUTION:** This overwrites current database!

1. Click **"Restore"** next to backup
2. Confirm action (double-check!)
3. System creates safety backup first
4. Restoration begins
5. Wait for completion
6. Verify data restored correctly

### Automatic Backup Schedule
- **Frequency:** Daily at 2:00 AM UTC
- **Retention:** 30 days
- **Location:** Server /backups directory
- **Verification:** Check Backups tab weekly

### Backup Best Practices
✅ Download weekly backups to local storage  
✅ Keep off-site backups (Google Drive/Dropbox)  
✅ Test restore procedure quarterly  
✅ Document backup locations  
✅ Never delete all backups  

---

## 📧 Email Communications

### Sending Custom Emails
1. Navigate to **Communications**
2. Choose:
   - **Template Email** (pre-designed)
   - **Custom Email** (free-form)
3. Enter:
   - Recipient email
   - Subject
   - Message
4. Preview before sending
5. Send

### Email Templates Available
- Welcome email
- Course enrollment confirmation
- Payment receipt
- Booking confirmation
- Certificate issued
- Password reset
- Custom messages

### Bulk Emails (Future Feature)
- Contact tech support for implementation
- Can send to member segments

---

## 🚨 Emergency Procedures

### System Down / Not Responding
1. Check Render dashboard for errors
2. View server logs
3. Restart server if needed
4. Contact technical support
5. Use backup site (if available)

### Payment System Failure
1. Switch to manual payment recording
2. Note all affected transactions
3. Contact Paystack support
4. Reconcile once system restored
5. Inform members of delays

### Database Corruption
1. **DO NOT PANIC**
2. Stop making changes immediately
3. Access most recent backup
4. Contact technical support
5. Restore from backup if necessary
6. Document what happened

### Data Breach Suspected
1. Change all admin passwords immediately
2. Check access logs
3. Contact technical security team
4. Inform affected users (if confirmed)
5. Document incident

---

## 📅 Daily Tasks Checklist

### Morning (9:00 AM)
- [ ] Login to admin dashboard
- [ ] Check overnight payments
- [ ] Review new member registrations
- [ ] Check email notifications
- [ ] View today's desk bookings

### Midday (12:00 PM)
- [ ] Process any manual payments
- [ ] Respond to support emails
- [ ] Update course information (if needed)
- [ ] Check desk check-ins

### Evening (5:00 PM)
- [ ] Review day's activities
- [ ] Complete check-outs
- [ ] Generate daily report
- [ ] Note any issues for follow-up
- [ ] Logout

### Weekly Tasks
- [ ] Download database backup
- [ ] Review analytics
- [ ] Check expiring memberships
- [ ] Clean up old data
- [ ] Team meeting

### Monthly Tasks
- [ ] Generate monthly reports
- [ ] Review and update course content
- [ ] Audit user accounts
- [ ] Check system performance
- [ ] Plan improvements

---

## 🔧 Troubleshooting Common Issues

### "Member can't login"
1. Verify email is correct
2. Check if account is active
3. Reset their password
4. Check for typos in credentials

### "Payment not reflecting"
1. Search by reference number
2. Check Paystack dashboard
3. Verify webhook received
4. Manual update if needed

### "Can't create new admin"
1. Check if username already exists
2. Verify super admin privileges
3. Try different username
4. Check database space

### "Backup failed"
1. Check available disk space
2. Verify backup service running
3. Try manual backup
4. Contact technical support

### "Certificate not generating"
1. Verify course completion status
2. Check certificate template
3. Try regenerating
4. Contact technical support

---

## 📞 Support Contacts

**Technical Support:**  
Email: tech@kdih.org  
Phone: [Tech Support Number]  
Hours: 24/7 for emergencies

**Paystack Support:**  
Email: support@paystack.com  
Phone: [Paystack Number]  

**Render (Hosting):**  
Dashboard: https://dashboard.render.com  
Support: Via dashboard

---

## 🎯 Admin Best Practices

✅ **Always verify before deleting**  
✅ **Document unusual situations**  
✅ **Be prompt with member support**  
✅ **Keep credentials secure**  
✅ **Backup before major changes**  
✅ **Review analytics weekly**  
✅ **Maintain professional communication**  
✅ **Report bugs immediately**  
✅ **Stay updated on system changes**  

**Questions? Contact your supervisor or technical team.**
