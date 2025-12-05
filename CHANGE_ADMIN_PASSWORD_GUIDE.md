# How to Change Admin Password

## Your Admin Accounts

- **Username:** `admin` | **Default Password:** `admin123`
- **Username:** `superadmin` | **Default Password:** `superadmin123`

---

## Method 1: Using the Password Change Script (Recommended)

### On Render (Via Shell):

1. Go to **Render Dashboard** → Your service
2. Click on **"Shell"** tab (top navigation)
3. Run this in the shell:

```bash
node change-admin-password.js
```

4. Follow the prompts:
   - Enter username: `admin`
   - Enter new password: `YourNewPassword123`
   - Confirm password: `YourNewPassword123`

---

## Method 2: Update Locally & Redeploy

1. **Run locally:**
   ```bash
   cd "/Users/yankyaure/Downloads/kdih_website 2"
   node change-admin-password.js
   ```

2. **Follow prompts** to set new password

3. **Push to GitHub:**
   ```bash
   git add change-admin-password.js
   git commit -m "Add password change script"
   git push
   ```

4. **Wait for Render auto-deploy** (3-5 minutes)

---

## Method 3: Direct Database Update (Advanced)

If you have database access, run:

```sql
UPDATE admins 
SET password = '$2b$10$YOUR_BCRYPT_HASH_HERE' 
WHERE username = 'admin';
```

*Note: You need to generate a bcrypt hash first*

---

## Generate BCrypt Hash (for Method 3)

Run this Node.js code:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('YourNewPassword', 10, (err, hash) => {
    console.log(hash);
});
```

---

## Easiest Solution Right Now:

Since your site is on Render:

1. **Use Render Shell** (Method 1 above)
   - Open your service on Render
   - Go to Shell tab
   - Run `node change-admin-password.js`
   - Change both `admin` and `superadmin` passwords

OR

2. **Wait until you configure kdih.org domain**, then we can add a proper password change feature to the admin dashboard.

---

## Next: Add Password Change to Dashboard

For a permanent solution, I can add a "Change Password" feature to your admin dashboard. This would allow you to change passwords from the web interface without needing shell access.

Would you like me to add this feature now?
