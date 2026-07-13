/* =========================================================================
   PRODUCT DATA  (PUBLIC FILE)
   -------------------------------------------------------------------------
   Yeh reels BUNDLE hai — coaching course nahi.
   Customer ₹99 deta hai, 2000+ HD football reels ka Google Drive folder
   milta hai, jise wo apne Insta / YouTube / Facebook page pe daal ke
   followers aur views badha sake.

   Asli Drive folder link YAHAN NAHI hai — wo Netlify ke secret env var
   (FOLDER_FOOTBALL) me hai, payment verify hone ke baad hi milta hai.
   ========================================================================= */

window.COURSES = [
  {
    id: "football",                 // env var isi se: FOLDER_FOOTBALL
    url: "/",
    live: true,
    comingSoon: false,
    badge: "BESTSELLER",
    title: "2000+ Football Reels Bundle",
    tagline: "Ready-to-post HD reels. Roz daal, page grow kar, views kama.",
    price: 99,
    mrp: 999,
    currency: "INR",
    heroLine: "Blow Up Your Football Page",
    promise: "2000+ pehle se edited HD football reels — Ronaldo, Messi, Neymar aur baaki top players. Bas download karo aur apne page pe daalo. Koi editing nahi.",
    stats: [
      { num: "2000+", label: "Ready reels" },
      { num: "HD",    label: "Best quality" },
      { num: "Lifetime", label: "One-time access" }
    ],
    categories: [
      "Ronaldo edits",
      "Messi magic",
      "Neymar skills",
      "Goals & bangers",
      "Skills & dribbles",
      "Celebrations",
      "Motivation edits",
      "Freestyle & tricks",
      "Rivalry / GOAT edits",
      "Slow-mo cinematic clips",
      "Transfer / news style",
      "Trending audio-ready reels"
    ],
    thumbEmoji: "\u26bd"
  },
  {
    id: "aigirl",                   // env var isi se: FOLDER_AIGIRL
    url: "/ai-pack.html",
    live: true,
    comingSoon: false,
    badge: "NEW",
    title: "300+ AI Influencer Reels Pack",
    tagline: "Ready-to-post AI model reels. Theme page ke liye perfect.",
    price: 69,
    mrp: 699,
    currency: "INR",
    heroLine: "Grow Your AI Influencer Page",
    promise: "300+ AI-generated model/influencer reels \u2014 glam, fashion aur aesthetic edits. Download karo, apne page pe daalo, grow karo.",
    stats: [
      { num: "300+", label: "Ready reels" },
      { num: "HD",   label: "Best quality" },
      { num: "Lifetime", label: "One-time access" }
    ],
    categories: [],
    thumbEmoji: "\ud83d\udc83"
  },
  {
    id: "cartoon",                  // env var isi se: FOLDER_CARTOON
    url: "/cartoon-pack.html",
    live: true,
    comingSoon: false,
    badge: "NEW",
    title: "650+ AI Cartoon Story Reels Pack",
    tagline: "AI-generated cartoon story reels. Kids/story pages ke liye perfect.",
    price: 99,
    mrp: 999,
    currency: "INR",
    heroLine: "Grow Your Cartoon Page",
    promise: "650+ AI-generated cartoon story videos \u2014 ready-to-post. Download karo, apne page pe daalo, grow karo.",
    stats: [
      { num: "650+", label: "Ready videos" },
      { num: "HD",   label: "Best quality" },
      { num: "Lifetime", label: "One-time access" }
    ],
    categories: [],
    thumbEmoji: "\ud83c\udfac"
  },
  {
    id: "combo",                    // env var isi se: FOLDER_COMBO
    live: true,
    comingSoon: false,
    badge: "BEST DEAL",
    title: "All-Access Combo \u2014 Saare 3 Packs",
    tagline: "Football + AI Influencer + Cartoon \u2014 teeno packs ek saath.",
    price: 199,
    mrp: 267,
    currency: "INR",
    heroLine: "Sab Kuch. Ek Price.",
    promise: "2000+ football + 300+ AI influencer + 650+ cartoon reels \u2014 teeno Google Drive folders ek saath unlock. Lifetime access.",
    stats: [
      { num: "2950+", label: "Total reels" },
      { num: "3", label: "Packs included" },
      { num: "Lifetime", label: "One-time access" }
    ],
    categories: [],
    thumbEmoji: "\ud83d\udd25"
  }
];
