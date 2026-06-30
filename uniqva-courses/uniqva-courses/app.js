/* =========================================================================
   APP.JS — rendering + secure checkout flow
   Flow: buy click -> details modal -> create-order (server) ->
         Razorpay checkout -> verify-payment (server) -> watch page
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

  function openModal() { if (modalBg) { modalBg.classList.add("show"); if (mName) mName.focus(); setErr(""); } }
  function closeModal() { if (modalBg) modalBg.classList.remove("show"); }
  function setErr(t) { if (mErr) mErr.textContent = t || ""; }

  function getCourse(id) { return courses.find(function (c) { return c.id === id; }) || featured; }

  /* ---- the payment flow ---- */
  function startPayment() {
    var course = getCourse(activeCourseId);
    if (!course) { setErr("Course not found. Refresh karke try karo."); return; }

    var name  = (mName.value || "").trim();
    var email = (mEmail.value || "").trim();
    var phone = (mPhone.value || "").replace(/\D/g, "");

    if (!name)                       { setErr("Naam daalo."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr("Sahi email daalo."); return; }
    if (phone.length < 10)           { setErr("10-digit phone number daalo."); return; }

    setErr("");
    mPay.disabled = true;
    mPay.textContent = "Please wait…";

    // 1) create order on server
    fetch("/.netlify/functions/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id })
    })
      .then(function (r) { return r.json(); })
      .then(function (order) {
        if (!order || !order.id) throw new Error(order && order.error ? order.error : "Order failed");

        // 2) open Razorpay checkout
        var rzp = new Razorpay({
          key: order.keyId,                 // public key from server
          order_id: order.id,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Uniqva Football",
          description: course.title,
          image: "",                        // optional logo url
          prefill: { name: name, email: email, contact: phone },
          theme: { color: "#19C37D" },
          handler: function (resp) { verifyAndUnlock(resp, course); },
          modal: {
            ondismiss: function () {
              mPay.disabled = false;
              mPay.textContent = "Pay ₹" + course.price + " & Unlock →";
            }
          }
        });
        rzp.on("payment.failed", function () {
          setErr("Payment fail hua. Dobara try karo.");
          mPay.disabled = false;
          mPay.textContent = "Pay ₹" + course.price + " & Unlock →";
        });
        rzp.open();
      })
      .catch(function (e) {
        setErr(e.message || "Kuch galat hua. Try again.");
        mPay.disabled = false;
        mPay.textContent = "Pay ₹" + course.price + " & Unlock →";
      });
  }

  /* ---- verify on server, then go to members page ---- */
  function verifyAndUnlock(resp, course) {
    mPay.textContent = "Verifying payment…";
    fetch("/.netlify/functions/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: course.id,
        razorpay_order_id: resp.razorpay_order_id,
        razorpay_payment_id: resp.razorpay_payment_id,
        razorpay_signature: resp.razorpay_signature
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
              paymentId: resp.razorpay_payment_id
            }));
          } catch (e) {}
          window.location.href = "watch.html?course=" + encodeURIComponent(course.id);
        } else {
          throw new Error(data && data.error ? data.error : "Verification failed");
        }
      })
      .catch(function (e) {
        setErr("Payment hua but verify nahi hua. WhatsApp pe payment ID bhejo: " +
               (resp.razorpay_payment_id || ""));
        mPay.disabled = false;
        mPay.textContent = "Retry";
      });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }
})();
