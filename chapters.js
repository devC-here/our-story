// netlify/functions/chapters.js
// Serverless function — handles GET and POST for chapter data
// Uses Netlify Blobs (free, built-in key-value store)

const { getStore } = require("@netlify/blobs");

const STORE_NAME = "our-story";
const BLOB_KEY   = "chapters";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const store = getStore(STORE_NAME);

  // ── GET — return saved chapters ──────────────────────────────────
  if (event.httpMethod === "GET") {
    try {
      const raw = await store.get(BLOB_KEY);
      if (!raw) {
        // Nothing saved yet — return empty list so index.html uses its defaults
        return { statusCode: 200, headers, body: JSON.stringify({ chapters: [] }) };
      }
      return { statusCode: 200, headers, body: raw };
    } catch (err) {
      console.error("GET error:", err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to load chapters" }) };
    }
  }

  // ── POST — save chapters ─────────────────────────────────────────
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      if (!Array.isArray(body.chapters)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid payload" }) };
      }

      await store.set(BLOB_KEY, JSON.stringify({ chapters: body.chapters }));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      console.error("POST error:", err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save chapters" }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
