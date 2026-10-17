// The ONLY file that talks to the backend.
// Set VITE_USE_MOCK=true in .env to use canned replies instead of the real server.

const API_URL = import.meta.env.VITE_API_URL ?? ""; // "" = same origin (Vite proxy in dev)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const TIMEOUT_MS = 30000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mockReply(message) {
  const text = message.toLowerCase();

  if (text.includes("indian")) {
    return "Here are some Indian options:\n• Spice Palace ⭐4.5 ₹₹\n• Curry House ⭐4.3 ₹₹\n• Taj Flavors ⭐4.7 ₹₹₹";
  }
  if (text.includes("chinese")) {
    return "Here are some Chinese options:\n• Dragon House ⭐4.5 ₹₹\n• Ming's Kitchen ⭐4.3 ₹₹\n• Golden Wok ⭐4.8 ₹₹₹";
  }
  if (text.includes("golden wok")) {
    return "Golden Wok (4.8⭐)\n📍 777 Wok Street, Central Market\n📞 9555666777\n🕒 11 AM - 11 PM\nSpecialties: Szechuan Noodles, Dim Sum";
  }
  if (text.includes("fail") || text.includes("error")) {
    throw new Error("Mock failure"); // lets us test the error bubble
  }
  if (text.includes("reserv") || text.includes("free") || text.includes("available")) {
    return "✓ Spice Palace has availability for 4 people on 2024-11-15";
  }
  return "That's outside what I can help with. I can search restaurants, show details and check reservation availability.";
}

/**
 * @param {string} message  the new user message
 * @param {{role: string, content: string}[]} history  earlier messages
 * @returns {Promise<string>} the assistant's reply text
 */
export async function sendChat(message, history) {
  if (USE_MOCK) {
    await delay(900); // pretend the agent is thinking
    return mockReply(message);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || `Request failed (${response.status})`);
    }

    const data = await response.json();
    return data.reply;
  } finally {
    clearTimeout(timer);
  }
}
