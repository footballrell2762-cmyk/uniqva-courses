# ⚽ Uniqva Football — Course Selling Website

2000+ football drills bundle bechne wali website. Razorpay payment + automatic
delivery + multi-course ready. Secure: course ka asli link bina payment ke kabhi
expose nahi hota.

---

## 📁 Files kya hain

```
uniqva-courses/
├─ index.html            # homepage / sales + checkout page
├─ watch.html            # payment ke baad members/access page
├─ courses.js            # course ki marketing info (naya course yahan add karo)
├─ app.js                # checkout logic
├─ style.css             # design
├─ netlify.toml          # netlify config
└─ netlify/functions/
   ├─ create-order.js    # Razorpay order banata hai (server)
   └─ verify-payment.js  # payment verify karke link deta hai (server)
```

---

## ✅ Launch karne ke liye 6 steps

### 1) Razorpay account (sabse pehle — KYC me 1–2 din lagte hain)
- razorpay.com pe **business account** banao
- KYC complete karo (PAN + bank account)
- Dashboard → **Settings → API Keys → Generate Key**
- 2 cheezein milengi: **Key ID** aur **Key Secret** — dono safe rakho

### 2) Google Drive folder
- Apne 2000+ drill videos ek folder me daalo
- Folder pe right-click → **Share → "Anyone with the link" → Viewer**
- Folder ka link copy karo (yahi customer ko milega)

### 3) GitHub pe code daalo
- github.com pe ek naya repo banao
- Yeh poora `uniqva-courses` folder usme upload/push kar do

### 4) Netlify pe deploy
- netlify.com pe login (GitHub se)
- **Add new site → Import from GitHub** → apna repo choose karo
- Build settings auto aa jaayenge (netlify.toml se) → **Deploy**

### 5) Secret keys Netlify me daalo (SABSE IMPORTANT)
Netlify site → **Site settings → Environment variables → Add** — ye 3 daalo:

| Key | Value |
|-----|-------|
| `RAZORPAY_KEY_ID` | tumhari Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | tumhari Razorpay Key Secret |
| `FOLDER_FOOTBALL` | step 2 ka Google Drive folder link |

Phir **Deploys → Trigger deploy → Deploy site** (taaki keys load ho).

> ⚠️ Key Secret aur folder link sirf yahan (Netlify env) me hote hain —
> code/website me kabhi nahi. Isliye koi inspect karke chura nahi sakta.

### 6) Apna domain laga do
- Hostinger/GoDaddy se domain kharido (jaise `uniqvafootball.in`)
- Netlify → **Domain settings → Add custom domain** → DNS connect karo
- `index.html` aur `watch.html` me `YOURDOMAIN.in` aur WhatsApp number
  (`91XXXXXXXXXX`) apne se replace kar do

---

## 🧪 Test karna (paisa kate bina)
Razorpay **Test Mode** ON karo → Test API keys use karo → test card:
`4111 1111 1111 1111`, koi future expiry, koi CVV. Pura flow check karo.
Sab sahi → **Live Mode** ON, live keys daalo.

---

## ➕ Naya course add karna (future)
1. `courses.js` me naya object add karo (id, title, price, etc.)
2. Netlify me us course ka link daalo: `FOLDER_<ID>` (jaise `FOLDER_FUTSAL`)
3. `create-order.js` ke `COURSE_AMOUNTS` me amount add karo
Bas — naya course live.

---

## 📣 Facebook/Meta Ads
- Ad ka link seedha homepage pe bhejo: `https://yourdomain.in/`
- UTM laga ke track karo: `?utm_source=fb&utm_campaign=football99`
- Single product (₹99) push karo — focused page = zyada conversion
