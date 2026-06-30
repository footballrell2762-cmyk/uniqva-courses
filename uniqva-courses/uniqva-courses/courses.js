/* =========================================================================
   COURSES DATA  (PUBLIC FILE)
   -------------------------------------------------------------------------
   Yahan sirf MARKETING info rakho. Course ka asli Google Drive folder link
   YAHAN MAT DAALO — wo Netlify ke secret environment variables me jaata hai
   (verify-payment function use karta hai). Tabhi koi bina pay kiye link
   nahi chura sakta.

   NAYA COURSE ADD karna ho to bas neeche ek naya object add kar do.
   - "comingSoon: true"  -> abhi sirf teaser dikhega, buy band rahega
   - "comingSoon: false" -> live, log pay karke access le sakte hain
   ========================================================================= */

window.COURSES = [
  {
    id: "football",                 // unique id (env var isi se banta hai: FOLDER_FOOTBALL)
    live: true,
    comingSoon: false,
    badge: "BESTSELLER",
    title: "2000+ Football Drills Bundle",
    tagline: "Ghar baithe pro-level skills. Roz naye drills, lifetime access.",
    price: 99,
    mrp: 999,                       // anchor price (kati hui kimat)
    currency: "INR",
    heroLine: "Become Undroppable",
    promise: "2000+ short drill videos — dribbling, first touch, finishing, speed, agility & match IQ. Sab kuch ek hi bundle me.",
    stats: [
      { num: "2000+", label: "Drill videos" },
      { num: "12", label: "Skill categories" },
      { num: "₹99", label: "One-time, lifetime" }
    ],
    categories: [
      "Dribbling & Close Control",
      "First Touch & Ball Mastery",
      "Finishing & Shooting",
      "Passing & Vision",
      "Speed & Agility (SAQ)",
      "Defending & Tackling",
      "1v1 Moves & Skills",
      "Wall / Solo Drills",
      "Fitness & Conditioning",
      "Warm-up & Recovery",
      "Goalkeeper Basics",
      "Match IQ & Positioning"
    ],
    thumbEmoji: "⚽"
  },

  /* ----- AAGE KE COURSES (abhi coming soon, ready jab content ho) -----
  {
    id: "futsal",
    live: false,
    comingSoon: true,
    badge: "COMING SOON",
    title: "Futsal Mastery Bundle",
    tagline: "Tight-space control & quick feet.",
    price: 99, mrp: 999, currency: "INR",
    heroLine: "Own The Small Court",
    promise: "...",
    stats: [], categories: [], thumbEmoji: "🥅"
  },
  */
];
