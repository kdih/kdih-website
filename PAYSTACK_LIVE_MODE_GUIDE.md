# Switching Paystack from Test to Live Mode
**⚠️ CRITICAL: Do this 1-2 days before launch (Dec 29-30, 2025)**

---

## 📋 Prerequisites

Before switching to live mode:
- [ ] All testing completed successfully
- [ ] Test payments work perfectly
- [ ] Webhook handling verified
- [ ] Payment flow end-to-end tested
- [ ] Refund procedure tested
- [ ] Business verified with Paystack
- [ ] Bank account connected to Paystack

---

## 🔑 Step 1: Get Live API Keys

### Login to Paystack Dashboard
1. Go to https://dashboard.paystack.com
2. Login with your business account
3. Navigate to **Settings** → **API Keys & Webhooks**

### Verify Business Account
**Before you can go live:**
- Business must be verified by Paystack
- Required documents submitted
- Bank account linked
- Test transactions completed

### Copy Live Keys
1. Find **Live Keys** section
2. Copy:
   - **Public Key** (starts with `pk_live_...`)
   - **Secret Key** (starts with `sk_live_...`)
3. ⚠️ **NEVER share** secret key
4. ⚠️ **NEVER commit** to Git

---

## 🔧 Step 2: Update Environment Variables

### On Render.com

1. Go to https://dashboard

.render.com
2. Select your service (kdih-website)
3. Go to **Environment** tab
4. Update these variables:

```
PAYSTACK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXX
PAYSTACK_PUBLIC_KEY=pk_live_XXXXXXXXXXXXXXXX
```

5. Click **Save Changes**
6. Service will automatically redeploy

### Verify Update
1. After redeploy completes
2. Check application logs
3. Confirm no errors on startup
4. Test a small real payment (₦100)

---

## 🌐 Step 3: Update Webhook URL (IMPORTANT!)

### Why This Matters
Webhooks notify your system when payments complete. **Critical for auto-enrollment!**

### Set Webhook URL
1. In Paystack Dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Scroll to **Webhook URL**
4. Enter: `https://your-domain.com/api/payments/webhook`
5. Click **Save**

### Test Webhook
1. Make a test payment (₦100)
2. Check your database
3. Verify:
   - Payment status updated
   - Member enrolled in course (if course payment)
   - Email sent
4. Refund test payment if needed

---

## 💳 Step 4: Test Live Payments

### Small Test Transaction
**Before going fully live:**

1. Use YOUR OWN card (not customer)
2. Make payment of ₦100-500
3. Verify:
   - ✅ Payment initialized
   - ✅ Redirected to Paystack
   - ✅ Payment successful
   - ✅ Webhook received
   - ✅ Database updated
   - ✅ Email sent
   - ✅ Dashboard reflects payment

### Refund Test Payment
1. Login to Paystack Dashboard
2. Find test transaction
3. Click **Refund**
4. Process refund
5. Verify member notified

### Common Test Scenarios
**Test these with real small payments:**
- [ ] Course payment → LMS enrollment
- [ ] Desk booking payment
- [ ] Failed payment handling
- [ ] Duplicate payment prevention

---

## 🔍 Step 5: Verify Everything

### Checklist Before Launch
- [ ] Live API keys in environment variables
- [ ] Webhook URL configured correctly
- [ ] Test payment successful
- [ ] Refund works
- [ ] Email notifications sent
- [ ] Database updates correctly
- [ ] No test keys in code
- [ ] All test data removed

### Monitor Closely
**First Week After Launch:**
- Check Paystack dashboard daily
- Monitor all transactions
- Respond quickly to failed payments
- Keep customer support ready

---

## 🚨 Troubleshooting

### Payments Not Going Through
1. Check API keys are correct (live, not test)
2. Verify keys saved in Render
3. Check service redeployed after key change
4. Review application logs for errors

### Webhook Not Firing
1. Verify webhook URL in Paystack dashboard
2. Check URL is publicly accessible
3. Test webhook manually (Paystack tools)
4. Review server logs for incoming requests

### Database Not Updating
1. Webhook might not be firing
2. Check webhook verification logic
3. Review API endpoint logs
4. Verify database connection

### Card Declined Errors
1. Normal - customer's bank declined
2. Advise customer to contact bank
3. Suggest alternative payment method
4. Offer bank transfer option

---

## 📊 Monitoring & Analytics

### Paystack Dashboard
**Check Daily:**
- Transaction volume
- Success rate
- Failed transactions
- Settlement reports

### Your Admin Dashboard
**Monitor:**
- Payment success rate
- Failed payment patterns
- Revenue tracking
- Member payment status

---

## 💰 Settlements & Payouts

### How Paystack Works
- Payments **settle** to your bank account
- Settlement schedule: T+1 or T+2 (next 1-2 business days)
- Paystack fees deducted automatically

### Check Settlements
1. Paystack Dashboard → **Transactions** → **Settlements**
2. View settlement schedule
3. Reconcile with bank account
4. Download settlement reports

### Fees
**Paystack Transaction Fees:**
- Local cards: 1.5% capped at ₦2,000
- International cards: 3.9%
- Check current rates at https://paystack.com/pricing

---

## 🔐 Security Best Practices

### Protecting API Keys
✅ **DO:**
- Store in environment variables only
- Never commit to Git
- Rotate keys if compromised
- Limit access to dashboard
- Use strong Paystack password
- Enable 2FA on Paystack account

❌ **DON'T:**
- Hardcode in source code
- Share via email/chat
- Store in frontend code
- Commit to public repositories

### Monitoring for Fraud
- Review unusual transactions
- Watch for duplicate payments
- Monitor failed payment patterns
- Set up Paystack alerts

---

##  Emergency Rollback

### If Live Mode Has Issues

**Option 1: Revert to Test Mode Temporarily**
1. Change environment variables back to test keys
2. Redeploy application
3. Fix issue
4. Switch back to live

**Option 2: Disable Online Payments**
1. Remove payment buttons temporarily
2. Process manual payments only
3. Fix payment system
4. Re-enable online payments

---

## 📞 Support Contacts

**Paystack Support:**
- Email: support@paystack.com
- Phone: +234 (1) 888-8881
- Help Center: https://support.paystack.com

**Your Technical Team:**
- [Your contact info]

---

## ✅ Final Checklist

Before declaring live mode successful:

- [ ] Live API keys configured
- [ ] Webhook working perfectly
- [ ] Test payment successful and refunded
- [ ] All test keys removed from codebase
- [ ] Settlement account verified
- [ ] Support team briefed on payment issues
- [ ] Customer payment instructions updated
- [ ] Refund procedure documented
- [ ] Monitoring in place

**Document this date: ________________**  
**Switched to live mode by: ________________**  
**Verified by: ________________**

---

**🎉 Congratulations on going live! Make sure to monitor closely for the first few days.**
