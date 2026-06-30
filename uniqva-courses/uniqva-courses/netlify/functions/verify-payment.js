/* =========================================================================
   verify-payment  (Netlify serverless function)
   Razorpay signature ko verify karta hai. SAHI payment hone par hi course
   ka SECRET Google Drive folder link return karta hai. Isliye bina pay kiye
   koi link nahi nikaal sakta.

   Required Netlify env vars:
     RAZORPAY_KEY_SECRET     (SECRET)
     FOLDER_FOOTBALL         (us course ka asli Drive folder link)
     FOLDER_<COURSEID>       (har naye course ke liye)
   ========================================================================= */

const crypto = require("crypto");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return json(500, { error: "Server not configured" });

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (e) { return json(400, { error: "Bad request" }); }

  const courseId = String(body.courseId || "");
  const orderId  = String(body.razorpay_order_id || "");
  const payId    = String(body.razorpay_payment_id || "");
  const signature = String(body.razorpay_signature || "");

  if (!courseId || !orderId || !payId || !signature) {
    return json(400, { error: "Missing payment fields" });
  }

  // verify signature: HMAC_SHA256(order_id|payment_id, key_secret)
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(orderId + "|" + payId)
    .digest("hex");

  const valid = safeEqual(expected, signature);
  if (!valid) {
    return json(400, { success: false, error: "Invalid payment signature" });
  }

  // signature good -> hand over the secret folder link for this course
  const folderLink = process.env["FOLDER_" + courseId.toUpperCase()];
  if (!folderLink) {
    return json(500, { success: false, error: "Course link not configured" });
  }

  return json(200, { success: true, folderLink: folderLink });
};

function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  };
}
