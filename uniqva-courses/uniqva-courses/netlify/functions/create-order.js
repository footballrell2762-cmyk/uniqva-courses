/* =========================================================================
   create-order  (Netlify serverless function)
   Razorpay order banata hai. Amount SERVER pe decide hota hai, isliye
   koi client se price change nahi kar sakta.

   Required Netlify env vars:
     RAZORPAY_KEY_ID       (public-ish key)
     RAZORPAY_KEY_SECRET   (SECRET — kabhi frontend me mat daalo)
   ========================================================================= */

// Server-side price map (paise me). Naya course -> yahan amount add karo.
const COURSE_AMOUNTS = {
  football: 9900   // ₹99.00
  // futsal: 9900,
};

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return json(500, { error: "Server not configured (missing Razorpay keys)" });
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (e) { return json(400, { error: "Bad request" }); }

  const courseId = String(body.courseId || "");
  const amount = COURSE_AMOUNTS[courseId];
  if (!amount) return json(400, { error: "Unknown course" });

  const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + auth,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        currency: "INR",
        receipt: "rcpt_" + courseId + "_" + Date.now(),
        notes: { courseId: courseId }
      })
    });

    const order = await res.json();
    if (!res.ok || !order.id) {
      return json(502, { error: (order.error && order.error.description) || "Order creation failed" });
    }

    // return only what the browser needs (keyId is public, secret stays here)
    return json(200, {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId
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
