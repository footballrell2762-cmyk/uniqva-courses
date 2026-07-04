# 🔄 Razorpay → Cashfree Switch — Setup Guide

Code pura Cashfree pe convert ho chuka hai. Ab sirf ye steps karo:

## 1) Netlify env variables badlo (SABSE IMPORTANT — yahi error aa raha tha)

Netlify → tumhari site → **Site configuration → Environment variables**

**Purane DELETE karo:**
- `RAZORPAY_KEY_ID` ❌
- `RAZORPAY_KEY_SECRET` ❌

**Naye ADD karo (naam EXACT yahi hone chahiye):**

| Key | Value |
|-----|-------|
| `CASHFREE_APP_ID` | Cashfree ka App ID (Client ID) |
| `CASHFREE_SECRET_KEY` | Cashfree ki Secret Key |
| `CASHFREE_ENV` | `production` |
| `FOLDER_FOOTBALL` | (already hai — mat chhedo) |

> ⚠️ Pehle error isliye aa raha tha: code `RAZORPAY_KEY_ID` naam ka variable
> dhoondh raha tha. Tumne Cashfree ki keys daali thi, par code Razorpay API
> call kar raha tha — isliye sirf env var badalne se kabhi kaam nahi karta.
> Ab code hi Cashfree ka hai.

## 2) Cashfree keys kahan milengi

- merchant.cashfree.com login → **Developers → API Keys**
- **Production** tab se App ID + Secret Key copy karo (test wali nahi!)

## 3) Domain whitelist karo (zaroori — warna checkout nahi khulega)

- Cashfree Dashboard → **Developers → Whitelisting** (ya API Keys ke paas)
- Apna website domain add karo, e.g. `tumhari-site.netlify.app`
  aur agar custom domain hai to woh bhi

## 4) Naya code deploy karo

- Ye pura `uniqva-courses-cashfree` folder GitHub repo me push karo
  (purani files replace kar do), Netlify auto-deploy karega
- YA Netlify me direct drag-and-drop deploy karo
- Phir **Deploys → Trigger deploy** (env vars load karne ke liye)

## 5) Test karo

- Site kholo → Buy → details bharo → Pay
- Cashfree ka popup khulega (Razorpay jaisa hi, same page pe)
- ₹99 ka khud se ek real payment karke pura flow test karo
  (baad me Cashfree dashboard se refund kar sakte ho)

## Kya-kya badla hai (technical)

| File | Change |
|------|--------|
| `netlify/functions/create-order.js` | Razorpay orders API → Cashfree `/pg/orders`, customer details ab order me jaati hain |
| `netlify/functions/verify-payment.js` | Signature check → Cashfree se direct order status check (zyada solid) |
| `app.js` | Razorpay checkout → Cashfree JS SDK v3 popup (`redirectTarget: "_modal"`) |
| `index.html` | Cashfree SDK script + text |
| `privacy/terms/refund/contact.html` | Razorpay → Cashfree text |

## Common errors

- **"Server not configured (missing Cashfree keys)"** → env var naam galat hai ya deploy trigger nahi kiya
- **Checkout popup nahi khulta** → domain whitelist nahi hua (step 3)
- **"Payment not completed"** → user ne popup band kiya, normal hai
