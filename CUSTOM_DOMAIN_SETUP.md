# Setting up kdih.org Custom Domain

Follow these steps to connect your domain (`kdih.org`) to your Render website.

## Step 1: Configure Render

1.  Log in to your **Render Dashboard**.
2.  Select your **kdih-website** service.
3.  Click on **Settings** in the left sidebar.
4.  Scroll down to the **Custom Domains** section.
5.  Click **Add Custom Domain**.
6.  Enter `kdih.org` and click **Save**.
7.  Click **Add Custom Domain** again.
8.  Enter `www.kdih.org` and click **Save**.

Render will now show you the required DNS records (A Record and CNAME).

## Step 2: Configure GoDaddy DNS

1.  Log in to your **GoDaddy** account.
2.  Go to your **Domain Portfolio** and select `kdih.org`.
3.  Click on **DNS** to manage records.
4.  **Delete** any existing A records for `@` (Parked) if they exist.
5.  Add the following records:

### Record 1 (Root Domain)
*   **Type:** `A`
*   **Name:** `@`
*   **Value:** `216.24.57.1`  *(This is Render's static IP for custom domains)*
*   **TTL:** `Custom` -> `600` (or 10 minutes / 1/2 hour)

### Record 2 (Subdomain)
*   **Type:** `CNAME`
*   **Name:** `www`
*   **Value:** `kdih-website.onrender.com`
*   **TTL:** `Custom` -> `600` (or 10 minutes / 1/2 hour)

## Step 3: Verification

1.  Go back to **Render**.
2.  It may say "Verifying..." or "Issue with DNS".
3.  Wait 5-10 minutes.
4.  Once verified, Render will automatically issue an SSL certificate (Verified for HTTPS).

## Troubleshooting

-   **Propagation Time:** DNS changes can take up to 48 hours, but usually happen within 30 minutes.
-   **"Parked" Page:** If you still see a GoDaddy parked page, clear your browser cache or try Incognito mode.
