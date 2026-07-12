/* =========================================================================
   create-order  (Netlify serverless function) — CASHFREE version
   Cashfree order banata hai. Amount SERVER pe decide hota hai, isliye
   koi client se price change nahi kar sakta.

   Required Netlify env vars:
     CASHFREE_APP_ID       (App ID / Client ID)
     CASHFREE_SECRET_KEY   (SECRET — kabhi frontend me mat daalo)
     CASHFREE_ENV          ("production" ya "sandbox" — default production)
   ========================================================================= */

// Server-side price map (RUPEES me, paise nahi). Naya course -> yahan add karo.
const COURSE_AMOUNTS = {
  football: 99.00   // ₹99.00
  // futsal: 99.00,
};

const API_VERSION = "2023-08-01";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) {
    return json(500, { error: "Server not configured (missing Cashfree keys)" });
  }

  const mode = (process.env.CASHFREE_ENV || "production") === "sandbox" ? "sandbox" : "production";
  const baseUrl = mode === "sandbox"
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (e) { return json(400, { error: "Bad request" }); }

  const courseId = String(body.courseId || "");
  const amount = COURSE_AMOUNTS[courseId];
  if (!amount) return json(400, { error: "Unknown course" });

  // Cashfree ko order banate waqt customer details chahiye hoti hain.
  // Name + phone zaroori; email OPTIONAL (kam fields = zyada sales).
  const name  = String(body.name || "").trim().slice(0, 100);
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
  if (phone.length < 10) {
    return json(400, { error: "Missing customer details" });
  }
  // Cashfree ko ek email chahiye, isliye na diya ho to phone se bana lo
  let email = String(body.email || "").trim().slice(0, 100);
  if (!/^\S+@\S+\.\S+$/.test(email)) email = phone + "@guest.uniqvareels.app";

  // Source tracking: customer kahan se aaya (ads/insta/direct) —
  // Cashfree ke order note + tags me dikhega
  const source = String(body.source || "unknown")
    .replace(/[^\w\/\-\.]/g, "").slice(0, 40) || "unknown";

  const orderId = "uniqva_" + courseId + "_" + Date.now();

  try {
    const res = await fetch(baseUrl + "/orders", {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": API_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "cust_" + phone,
          customer_name: name,
          customer_email: email,
          customer_phone: phone
        },
        order_note: courseId + " | src:" + source,
        order_tags: { courseId: courseId, source: source }
      })
    });

    const order = await res.json();
    if (!res.ok || !order.payment_session_id) {
      return json(502, { error: order.message || "Order creation failed" });
    }

    // return only what the browser needs (secret yahi server pe rehta hai)
    return json(200, {
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      mode: mode
    });
  } catch (e) {
    return json(500, { error: "Order request failed" });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  };
}
