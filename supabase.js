const SUPABASE_URL =
  "https://qswvuitxfamztcofauib.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_YoNibTafnFTJXyQF-4hA4A_zktjPFh2";

const CONTACT_FUNCTION_URL =
  `${SUPABASE_URL}/functions/v1/submit-contact`;

export async function submitContactMessage(payload) {
  const name = String(payload?.name ?? "").trim();
  const email = String(payload?.email ?? "").trim();
  const subject = String(payload?.subject ?? "").trim();
  const message = String(payload?.message ?? "").trim();
  const turnstileToken = String(
    payload?.turnstileToken ?? ""
  ).trim();

  if (!name || !email || !subject || message.length < 10) {
    throw new Error("Please complete all required fields.");
  }

  if (
    name.length > 100 ||
    email.length > 254 ||
    subject.length > 160 ||
    message.length > 5000
  ) {
    throw new Error(
      "One or more fields exceed the allowed length."
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!turnstileToken) {
    throw new Error(
      "Please complete the security verification."
    );
  }

  let response;

  try {
    response = await fetch(CONTACT_FUNCTION_URL, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        turnstileToken
      })
    });
  } catch {
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }

  let result = {};

  try {
    result = await response.json();
  } catch {
    // Handle responses that do not contain JSON.
  }

  if (!response.ok) {
    console.error(
      "Contact Edge Function returned HTTP",
      response.status
    );

    if (response.status === 429) {
      throw new Error(
        "Too many attempts. Please wait a little and try again."
      );
    }

    if (response.status === 400 || response.status === 422) {
      throw new Error(
        "Please check your details and security verification, then try again."
      );
    }

    throw new Error(
      "Your message could not be sent. Please try again or email zuhaibwazir558@gmail.com."
    );
  }

  return true;
}
