# Production Secrets Setup (Render)

To make sure your website is secure, payments work, and emails get sent, you must set these **Environment Variables** in Render.

## How to Add Secrets
1.  Go to your **Render Dashboard**.
2.  Select your **kdih-website** service.
3.  Click **Environment**.
4.  Click **Add Environment Variable** for each item below.

## Required Variables

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Tells Node.js to run in fast/secure mode. |
| `DB_PATH` | `/app/data/kdih.db` | **CRITICAL**: Points to your Persistent Disk. |
| `SESSION_SECRET` | *(Generate a random string)* | Type random letters/numbers (e.g., `hj8923h89s7s72`). Keeps logins secure. |
| `APP_URL` | `https://kdih.org` | Used for email links and payment redirects. No trailing slash `/`. |
| `EMAIL_SERVICE` | `gmail` | **Required** if using a Gmail address. |
| `EMAIL_USER` | `katsinadigitalhub@gmail.com` | Your Gmail address (or `info@kdih.org` if you have SMTP). |
| `EMAIL_PASSWORD` | *(Your 16-digit App Password)* | **Not** your login password. Search "Gmail App Password" to generate one. |
| `PAYSTACK_SECRET_KEY` | `sk_live_xxxxxxxx...` | Your **Live** Paystack Secret Key. |

---

### ⚠️ Important Notes
*   **Do NOT** use `sk_test_...` keys if you are ready to take real money. Use your live keys from Paystack Dashboard.
*   **Restart Service:** After adding these, Render might restart your app automatically. If not, click "Manual Deploy" -> "Restart Service".
