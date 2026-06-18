const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "Netsync";
const TERMII_BASE_URL = "https://api.ng.termii.com/api";

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "");
  return /^(\+234|0)[789]\d{9}$/.test(cleaned);
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) {
    return "+234" + cleaned.slice(1);
  }
  if (cleaned.startsWith("234")) {
    return "+" + cleaned;
  }
  return cleaned;
}

interface SendOtpResult {
  success: boolean;
  code: string;
  message: string;
}

export async function sendOtp(phone: string): Promise<SendOtpResult> {
  const code = generateOtpCode();

  if (!TERMII_API_KEY || process.env.NODE_ENV === "development") {
    return {
      success: true,
      code,
      message:
        process.env.NODE_ENV === "development"
          ? `Dev mode: OTP is ${code}`
          : "OTP sent successfully",
    };
  }

  try {
    const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: normalizePhone(phone),
        from: TERMII_SENDER_ID,
        sms: `Your Netsync verification code is: ${code}. Valid for 10 minutes.`,
        type: "plain",
        channel: "generic",
        api_key: TERMII_API_KEY,
      }),
    });

    if (!response.ok) {
      throw new Error(`Termii API error: ${response.status}`);
    }

    return { success: true, code, message: "OTP sent successfully" };
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown SMS error";
    return { success: false, code, message: `Failed to send OTP: ${errMsg}` };
  }
}
