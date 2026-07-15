/* =========================================================================
   verify-payment  (Netlify serverless function) — CASHFREE version
   Cashfree ke server se DIRECT order status check karta hai (server-to-server,
   isliye fake nahi ho sakta). Order PAID hone par hi course ka SECRET
   Google Drive folder link return karta hai.

   Required Netlify env vars:
     CASHFREE_APP_ID
     CASHFREE_SECRET_KEY
     CASHFREE_ENV            ("production" ya "sandbox")
     FOLDER_FOOTBALL         (us course ka asli Drive folder link)
     FOLDER_<COURSEID>       (har naye course ke liye)
   Optional (Conversions API — 100% pakka Purchase tracking):
     META_CAPI_TOKEN         (Events Manager > dataset > Settings >
                              Conversions API > Generate access token)
     META_PIXEL_ID           (default: 1574504784354009)
   ========================================================================= */

const crypto = require("crypto");

const API_VERSION = "2023-08-01";
const PIXEL_ID = process.env.META_PIXEL_ID || "1574504784354009";
const SITE_URL = "https://uniqvareels.netlify.app/";

// SHA-256 hash (Meta CAPI ke liye email/phone hash hote hain, plaintext nahi)
function sha256(v) {
  return crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");
}

// Server-to-server Purchase event Meta ko bhejo. event_id = orderId, taaki
// browser pixel + ye dono ek hi sale bhejein to Meta ek hi gine (dedup).
async function sendCapiPurchase(order) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return; // token nahi diya to chup-chaap skip (delivery pe koi asar nahi)

  const cust  = order.customer_details || {};
  const email = String(cust.customer_email || "").trim().toLowerCase();
  const phone = String(cust.customer_phone || "").replace(/\D/g, "").slice(-10);

  const user_data = {};
  if (email && /@/.test(email)) user_data.em = [sha256(email)];
  if (phone.length === 10)      user_data.ph = [sha256("91" + phone)];

  const payload = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: order.order_id,        // browser pixel ke saath dedup
      action_source: "website",
      event_source_url: SITE_URL,
      user_data: user_data,
      custom_data: { currency: "INR", value: Number(order.order_amount) || 0 }
    }]
  };

  const url = "https://graph.facebook.com/v19.0/" + PIXEL_ID +
              "/events?access_token=" + encodeURIComponent(token);
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) return json(500, { error: "Server not configured" });

  const baseUrl = (process.env.CASHFREE_ENV || "production") === "sandbox"
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (e) { return json(400, { error: "Bad request" }); }

  const courseId = String(body.courseId || "");
  const orderId  = String(body.order_id || "");

  if (!courseId || !orderId) {
    return json(400, { error: "Missing payment fields" });
  }

  try {
    // Cashfree se order ka asli status poochho
    const res = await fetch(baseUrl + "/orders/" + encodeURIComponent(orderId), {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": API_VERSION
      }
    });

    const order = await res.json();
    if (!res.ok || !order.order_id) {
      return json(502, { success: false, error: "Could not fetch order status" });
    }

    // 1) order PAID hona chahiye
    if (order.order_status !== "PAID") {
      return json(400, { success: false, error: "Payment not completed (status: " + order.order_status + ")" });
    }

    // 2) order isi course/cart ke liye bana hona chahiye (order swap na ho sake)
    const tags = order.order_tags || {};
    const paidCourseId = tags.courseId || String(order.order_note || "").split(" |")[0] || "";
    if (paidCourseId !== courseId) {
      return json(400, { success: false, error: "Order/course mismatch" });
    }

    // status PAID -> is order ke SAARE packs ke secret folder links do.
    // (purane single orders me items tag nahi hota — tab sirf courseId)
    const ids = tags.items ? String(tags.items).split(",") : [courseId];
    const folders = [];
    for (const id of ids) {
      const link = process.env["FOLDER_" + id.toUpperCase()];
      if (!link) {
        return json(500, { success: false, error: "Link not configured for: " + id });
      }
      folders.push({ id: id, link: link });
    }

    // Conversions API: server se seedha Meta ko Purchase bhejo (100% pakka,
    // browser/ad-blocker/session pe depend nahi). Fail ho to bhi delivery
    // rukni nahi chahiye — isliye try/catch me.
    try { await sendCapiPurchase(order); } catch (e) {}

    return json(200, {
      success: true,
      folderLink: folders[0].link,           // purane clients ke liye
      folders: folders,                      // cart: har pack ka folder
      amount: order.order_amount || null     // pixel ke liye asli amount
    });
  } catch (e) {
    return json(500, { success: false, error: "Verification request failed" });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  };
}
