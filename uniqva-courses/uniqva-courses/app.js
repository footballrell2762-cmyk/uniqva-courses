/* =========================================================================
   APP.JS — rendering + secure checkout flow (CASHFREE version)
   Flow: buy click -> details modal -> create-order (server) ->
         Cashfree checkout popup -> verify-payment (server) -> watch page
   ========================================================================= */
(function () {
  "use strict";

  var courses = window.COURSES || [];
  var featured = courses.find(function (c) { return c.live; }) || courses[0];

  /* ---- year ---- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- source tracking: customer kahan se aaya (ads / insta / direct) ----
     UTM mile to wahi jeetega; nahi to referrer se guess. Order ke saath
     Cashfree me "src:..." note ban ke jayega. */
  try {
    var qs = new URLSearchParams(window.location.search);
    var utmSrc = qs.get("utm_source");
    if (utmSrc) {
      var s = utmSrc;
      if (qs.get("utm_medium"))  s += "/" + qs.get("utm_medium");
      if (qs.get("utm_content")) s += "/" + qs.get("utm_content");
      localStorage.setItem("uniqva_src", s.slice(0, 60));
    } else if (!localStorage.getItem("uniqva_src")) {
      var ref = document.referrer || "";
      var guess = "direct";
      if (/instagram/i.test(ref)) guess = "instagram/organic";
      else if (/facebook|fb\.me/i.test(ref)) guess = "facebook/organic";
      else if (ref) {
        try { guess = "ref/" + new URL(ref).hostname.slice(0, 40); } catch (e) { guess = "ref/other"; }
      }
      localStorage.setItem("uniqva_src", guess);
    }
  } catch (e) {}

  /* ---- delivery recovery: agar payment ho gaya tha par flow toot gaya
     (UPI app se wapas aate waqt), to wapas aane pe khud verify karke
     folder de do. 24h tak ke pending orders hi check hote hain. ---- */
  function recoverPending() {
    var raw = null;
    try { raw = localStorage.getItem("uniqva_pending"); } catch (e) { return; }
    if (!raw) return;
    var p = null;
    try { p = JSON.parse(raw); } catch (e) {}
    if (!p || !p.orderId || (Date.now() - (p.ts || 0)) > 24 * 60 * 60 * 1000) {
      try { localStorage.removeItem("uniqva_pending"); } catch (e) {}
      return;
    }
    fetch("/.netlify/functions/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: p.courseId, order_id: p.orderId })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success && data.folderLink) {
          var c = getCourse(p.courseId);
          var t = p.courseId === "cart"
            ? "Aapke Packs"
            : ((c && c.title) || "Aapka Bundle");
          try {
            sessionStorage.setItem("uniqva_access", JSON.stringify({
              courseId: p.courseId,
              title: t,
              folderLink: data.folderLink,
              folders: data.folders || null,
              amount: data.amount || null,
              paymentId: p.orderId
            }));
          } catch (e) {}
          try { localStorage.removeItem("uniqva_pending"); } catch (e) {}
          window.location.href = "watch.html?course=" + encodeURIComponent(p.courseId);
        }
        // paid nahi hua -> chup-chaap rehne do; expire hone pe khud saaf ho jayega
      })
      .catch(function () {});
  }
  recoverPending();

  /* ---- render category grid ---- */
  var catGrid = document.getElementById("catGrid");
  if (catGrid && featured && featured.categories) {
    catGrid.innerHTML = featured.categories.map(function (c) {
      return '<div class="cat"><span class="tick">✓</span>' + escapeHtml(c) + '</div>';
    }).join("");
  }

  /* ---- render coming-soon grid ---- */
  var soonGrid = document.getElementById("soonGrid");
  if (soonGrid) {
    var soon = courses.filter(function (c) { return c.comingSoon; });
    if (soon.length === 0) {
      // show graceful placeholders so the section never looks empty
      soon = [
        { thumbEmoji: "🥅", title: "Futsal Mastery" },
        { thumbEmoji: "💪", title: "Strength & Speed" },
        { thumbEmoji: "🧠", title: "Match IQ Pro" }
      ];
    }
    soonGrid.innerHTML = soon.map(function (c) {
      return '<div class="soon"><div class="emo">' + (c.thumbEmoji || "⚽") +
        '</div><div class="tag">COMING SOON</div><h4>' + escapeHtml(c.title) + "</h4></div>";
    }).join("");
  }

  /* ---- checkout modal wiring ---- */
  var modalBg = document.getElementById("modalBg");
  var mClose  = document.getElementById("mClose");
  var mPay    = document.getElementById("mPay");
  var mErr    = document.getElementById("mErr");
  var mName   = document.getElementById("mName");
  var mEmail  = document.getElementById("mEmail");
  var mPhone  = document.getElementById("mPhone");
  var activeCourseId = null;

  /* ---- CART (shop page ke liye) ----
     localStorage me sirf course-ids ki list. Checkout par
     activeCourseId = "__cart__" ho to poora cart ek order me jata hai. */
  function getCart() {
    try { return JSON.parse(localStorage.getItem("uniqva_cart") || "[]"); }
    catch (e) { return []; }
  }
  function setCart(ids) {
    try { localStorage.setItem("uniqva_cart", JSON.stringify(ids)); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent("uniqva:cart")); } catch (e) {}
  }
  window.UNIQVA_CART = { get: getCart, set: setCart };

  // abhi kya kharida ja raha hai — single pack ya poora cart
  function getSelection() {
    if (activeCourseId === "__cart__") {
      var ids = getCart().filter(function (id) { return !!getExactCourse(id); });
      var total = 0;
      ids.forEach(function (id) { total += (getExactCourse(id).price || 0); });
      return ids.length ? { ids: ids, total: total, title: "Aapke " + ids.length + " Packs" } : null;
    }
    var c = getCourse(activeCourseId);
    return c ? { ids: [c.id], total: c.price, title: c.title } : null;
  }
  function getExactCourse(id) {
    return courses.find(function (c) { return c.id === id; }) || null;
  }

  document.querySelectorAll("[data-buy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeCourseId = btn.getAttribute("data-course") || (featured && featured.id);
      openModal();
    });
  });

  // product pages ke "Add to Cart" buttons — click pe cart me daalo,
  // button ke agle element (note/link) ko dikha do
  document.querySelectorAll("[data-addcart]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-addcart");
      if (!getExactCourse(id)) return;
      var cart = getCart();
      if (cart.indexOf(id) === -1) { cart.push(id); setCart(cart); }
      btn.textContent = "✓ Cart me add ho gaya";
      var note = btn.nextElementSibling;
      if (note && note.classList.contains("addcart-note")) note.style.display = "block";
    });
  });
  if (mClose) mClose.addEventListener("click", closeModal);
  if (modalBg) modalBg.addEventListener("click", function (e) { if (e.target === modalBg) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  if (mPay) mPay.addEventListener("click", startPayment);

  function openModal() {
    var sel = getSelection();
    if (!sel) { return; }
    if (modalBg) { modalBg.classList.add("show"); if (mName) mName.focus(); setErr(""); }
    if (mPay) { mPay.disabled = false; mPay.textContent = "Pay ₹" + sel.total + " & Unlock →"; }
    // Meta Pixel: buyer ne checkout shuru kiya
    try { if (window.fbq) fbq("track", "InitiateCheckout", { value: sel.total, currency: "INR" }); } catch (e) {}
  }
  function closeModal() { if (modalBg) modalBg.classList.remove("show"); }
  function setErr(t) { if (mErr) mErr.textContent = t || ""; }

  function getCourse(id) { return courses.find(function (c) { return c.id === id; }) || featured; }

  function resetPayBtn(sel) {
    mPay.disabled = false;
    mPay.textContent = "Pay ₹" + sel.total + " & Unlock →";
  }

  /* ---- the payment flow (single pack YA poora cart) ---- */
  function startPayment() {
    var sel = getSelection();
    if (!sel) { setErr("Kuch select nahi hua. Refresh karke try karo."); return; }
    var verifyId = sel.ids.length > 1 ? "cart" : sel.ids[0];

    var name  = (mName.value || "").trim();
    var email = (mEmail.value || "").trim();
    var phone = (mPhone.value || "").replace(/\D/g, "");

    if (!name)                                 { setErr("Naam daalo."); return; }
    if (phone.length < 10)                     { setErr("10-digit phone number daalo."); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { setErr("Email sahi daalo ya khaali chhod do."); return; }

    setErr("");
    mPay.disabled = true;
    mPay.textContent = "Please wait…";

    // 1) create order on server (Cashfree ko customer details bhi chahiye)
    var src = "unknown";
    try { src = localStorage.getItem("uniqva_src") || "unknown"; } catch (e) {}
    fetch("/.netlify/functions/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: sel.ids, name: name, email: email, phone: phone, source: src })
    })
      .then(function (r) { return r.json(); })
      .then(function (order) {
        if (!order || !order.paymentSessionId) {
          throw new Error(order && order.error ? order.error : "Order failed");
        }

        // pending order yaad rakho — agar UPI app se wapas aate waqt flow
        // toota, to agli visit pe recoverPending() isi se delivery karega
        try {
          localStorage.setItem("uniqva_pending", JSON.stringify({
            orderId: order.orderId, courseId: verifyId, ts: Date.now()
          }));
        } catch (e) {}

        // 2) open Cashfree checkout (popup on same page)
        var cashfree = Cashfree({ mode: order.mode || "production" });
        cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: "_modal"
        }).then(function (result) {
          // popup band hua — chahe success ho ya cancel, asli status
          // hamesha SERVER se verify hota hai (fake nahi ho sakta)
          if (result && result.error && !result.paymentDetails) {
            // user ne popup band kiya ya payment attempt fail hua —
            // phir bhi ek baar status check kar lo (kabhi kabhi paisa kat jaata hai)
            verifyAndUnlock(order.orderId, sel, true);
          } else {
            verifyAndUnlock(order.orderId, sel, false);
          }
        });
      })
      .catch(function (e) {
        setErr(e.message || "Kuch galat hua. Try again.");
        resetPayBtn(sel);
      });
  }

  /* ---- verify on server, then go to members page ---- */
  function verifyAndUnlock(orderId, sel, wasCancelled) {
    var verifyId = sel.ids.length > 1 ? "cart" : sel.ids[0];
    mPay.textContent = "Verifying payment…";
    fetch("/.netlify/functions/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: verifyId,
        order_id: orderId
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success && data.folderLink) {
          // hand the unlocked link(s) to the watch page for THIS session only
          try {
            sessionStorage.setItem("uniqva_access", JSON.stringify({
              courseId: verifyId,
              title: sel.title,
              folderLink: data.folderLink,
              folders: data.folders || null,
              amount: data.amount || sel.total,
              paymentId: orderId
            }));
          } catch (e) {}
          try { localStorage.removeItem("uniqva_pending"); } catch (e) {}
          if (sel.ids.length > 1) setCart([]);   // cart khali karo — kharid liya
          window.location.href = "watch.html?course=" + encodeURIComponent(verifyId);
        } else {
          if (wasCancelled) {
            setErr("Payment complete nahi hua. Dobara try karo.");
          } else {
            setErr("Payment hua but verify nahi hua. WhatsApp pe order ID bhejo: " + orderId);
          }
          resetPayBtn(sel);
        }
      })
      .catch(function (e) {
        setErr("Verify nahi ho paya. Agar paisa kat gaya hai to WhatsApp pe order ID bhejo: " + orderId);
        resetPayBtn(sel);
      });
  }

  /* ---- nav cart badge: har page ke upar cart count ---- */
  function updateNavCart() {
    var el = document.getElementById("navCartCount");
    if (!el) return;
    var n = getCart().filter(function (id) { return !!getExactCourse(id); }).length;
    el.textContent = n;
    el.classList.toggle("show", n > 0);
    // product pages: cart icon tabhi dikhe jab cart khaali na ho
    var wrap = el.parentElement;
    if (wrap && wrap.classList.contains("nav-cart-auto")) {
      wrap.classList.toggle("has-items", n > 0);
    }
  }
  document.addEventListener("uniqva:cart", updateNavCart);
  updateNavCart();

  /* ---- FOMO timer: aaj raat 12 baje tak ka countdown (roz reset) ---- */
  (function () {
    var els = document.querySelectorAll("[data-timer]");
    if (!els.length) return;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var now = new Date();
      var end = new Date(now); end.setHours(23, 59, 59, 999);
      var s = Math.max(0, Math.floor((end - now) / 1000));
      var t = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
      els.forEach(function (e) { e.textContent = t; });
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ---- scroll animations: .anim wale elements fade-up hote hain ---- */
  try {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("anim-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".anim").forEach(function (el) { io.observe(el); });
  } catch (e) {
    document.querySelectorAll(".anim").forEach(function (el) { el.classList.add("anim-in"); });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }
})();
