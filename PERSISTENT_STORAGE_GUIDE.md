# Setting up Persistent Storage (Database)

Since we are using SQLite, the database is a file (`kdih.db`). On Render (and most cloud platforms), files created or modified by the app are **lost** every time you deploy or restart unless you use a Persistent Disk.

## Step 1: Create a Disk in Render

1.  Go to your **Render Dashboard**.
2.  Click on your **kdih-website** service.
3.  Click on the **Disks** tab.
4.  Click **Add Disk**.
5.  **Name:** `kdih-data` (or anything you like)
6.  **Mount Path:** `/app/data`  **(CRITICAL: Must match exactly)**
7.  **Size:** 1 GB (Minimum is plenty for SQLite)
8.  Click **Create Disk**.

## Step 2: Update Environment Variable

1.  Go to the **Environment** tab.
2.  Find `DB_PATH`.
3.  Click **Edit**.
4.  Change Value to: `/app/data/kdih.db`
5.  Click **Save Changes**.

## WHAT WILL HAPPEN
-   Render will likely restart your service.
-   **Your previous database (admin users, etc.) will be replaced by a fresh one** because we are switching to a new, empty location.
-   **YOU WILL NEED TO RE-RUN THE SUPER ADMIN SCRIPT.**

## Step 3: Restore Super Admin Access
After the disk is attached and the app restarts:

1.  Go to **Shell**.
2.  Run: `node create-superadmin.js`
3.  Login with: `katsinadigitalhub@gmail.com` / `ChangeMe123!`

Now, your data will survive forever!
