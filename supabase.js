
const SUPABASE_URL = "https://qswvuitxfamztcofauib.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_YoNibTafnFTJXyQF-4hA4A_zktjPFh2";

export async function submitContactMessage(payload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const subject = String(payload.subject || "").trim();
  const message = String(payload.message || "").trim();

  if (!name || !email || !subject || message.length < 10) {
    throw new Error("Please complete all required fields.");
  }

  if (name.length > 100 || email.length > 254 ||
      subject.length > 160 || message.length > 5000) {
    throw new Error("One or more fields exceed the allowed length.");
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/contact_messages`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message
      })
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();

    console.error(
      "Supabase rejected contact submission:",
      response.status,
      errorDetails
    );

    throw new Error("Supabase contact submission failed.");
  }

  return true;
}
