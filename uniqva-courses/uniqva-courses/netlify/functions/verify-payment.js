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
   ========================================================================= */

const API_VERSION = "2023-08-01";

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

    // 2) order isi course ke liye bana hona chahiye (order swap na ho sake)
    const paidCourseId = (order.order_tags && order.order_tags.courseId) || order.order_note || "";
    if (paidCourseId !== courseId) {
      return json(400, { success: false, error: "Order/course mismatch" });
    }

    // status PAID -> hand over the secret folder link for this course
    const folderLink = process.env["FOLDER_" + courseId.toUpperCase()];
    if (!folderLink) {
      return json(500, { success: false, error: "Course link not configured" });
    }

    return json(200, { success: true, folderLink: folderLink });
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
