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

  document.querySelectorAll("[data-buy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeCourseId = btn.getAttribute("data-course") || (featured && featured.id);
      openModal();
    });
  });
  if (mClose) mClose.addEventListener("click", closeModal);
  if (modalBg) modalBg.addEventListener("click", function (e) { if (e.target === modalBg) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  if (mPay) mPay.addEventListener("click", startPayment);

  function openModal() {
    if (modalBg) { modalBg.classList.add("show"); if (mName) mName.focus(); setErr(""); }
    // Meta Pixel: buyer ne checkout shuru kiya
    try { if (window.fbq) fbq("track", "InitiateCheckout"); } catch (e) {}
  }
  function closeModal() { if (modalBg) modalBg.classList.remove("show"); }
  function setErr(t) { if (mErr) mErr.textContent = t || ""; }

  function getCourse(id) { return courses.find(function (c) { return c.id === id; }) || featured; }

  function resetPayBtn(course) {
    mPay.disabled = false;
    mPay.textContent = "Pay ₹" + course.price + " & Unlock →";
  }

  /* ---- the payment flow ---- */
  function startPayment() {
    var course = getCourse(activeCourseId);
    if (!course) { setErr("Course not found. Refresh karke try karo."); return; }

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
    fetch("/.netlify/functions/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, name: name, email: email, phone: phone })
    })
      .then(function (r) { return r.json(); })
      .then(function (order) {
        if (!order || !order.paymentSessionId) {
          throw new Error(order && order.error ? order.error : "Order failed");
        }

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
            verifyAndUnlock(order.orderId, course, true);
          } else {
            verifyAndUnlock(order.orderId, course, false);
          }
        });
      })
      .catch(function (e) {
        setErr(e.message || "Kuch galat hua. Try again.");
        resetPayBtn(course);
      });
  }

  /* ---- verify on server, then go to members page ---- */
  function verifyAndUnlock(orderId, course, wasCancelled) {
    mPay.textContent = "Verifying payment…";
    fetch("/.netlify/functions/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: course.id,
        order_id: orderId
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success && data.folderLink) {
          // hand the unlocked link to the watch page for THIS session only
          try {
            sessionStorage.setItem("uniqva_access", JSON.stringify({
              courseId: course.id,
              title: course.title,
              folderLink: data.folderLink,
              paymentId: orderId
            }));
          } catch (e) {}
          window.location.href = "watch.html?course=" + encodeURIComponent(course.id);
        } else {
          if (wasCancelled) {
            setErr("Payment complete nahi hua. Dobara try karo.");
          } else {
            setErr("Payment hua but verify nahi hua. WhatsApp pe order ID bhejo: " + orderId);
          }
          resetPayBtn(course);
        }
      })
      .catch(function (e) {
        setErr("Verify nahi ho paya. Agar paisa kat gaya hai to WhatsApp pe order ID bhejo: " + orderId);
        resetPayBtn(course);
      });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }
})();
