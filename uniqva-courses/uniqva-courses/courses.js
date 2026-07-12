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
    id: "combo",                    // env var isi se: FOLDER_COMBO
    live: true,
    comingSoon: false,
    badge: "BEST DEAL",
    title: "All-Access Combo \u2014 Saare Packs",
    tagline: "Football + AI Influencer \u2014 dono packs ek saath, ek price me.",
    price: 129,
    mrp: 168,
    currency: "INR",
    heroLine: "Sab Kuch. Ek Price.",
    promise: "2000+ football reels + 300+ AI influencer reels \u2014 dono Google Drive folders ek saath unlock. Lifetime access.",
    stats: [
      { num: "2300+", label: "Total reels" },
      { num: "2", label: "Packs included" },
      { num: "Lifetime", label: "One-time access" }
    ],
    categories: [],
    thumbEmoji: "\ud83d\udd25"
  }
];
