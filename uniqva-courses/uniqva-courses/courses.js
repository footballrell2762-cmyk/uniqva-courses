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
  }
];
