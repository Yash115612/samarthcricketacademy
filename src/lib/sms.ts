/**
 * SMS & Notification Utility
 * Handles WhatsApp notifications and MSG91 integration.
 */

export async function sendSMS(phone: string, message: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  
  if (process.env.MSG91_AUTH_KEY) {
    return sendMsg91(normalizedPhone, message);
  } else {
    console.log(`[SMS MOCK] To: ${normalizedPhone} | Message: ${message}`);
    return { success: true, provider: "mock" };
  }
}

async function sendMsg91(phone: string, message: string) {
  try {
    const API_KEY = process.env.MSG91_AUTH_KEY || "";
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
      })
    });

    const data = await res.json();
    return data.return === true;
  } catch (err) {
    return false;
  }
}

/**
 * WhatsApp Notification Utility (Mock)
 */
export async function sendWhatsApp(phone: string, message: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  console.log(`[WHATSAPP MOCK] To: ${normalizedPhone} | Message: ${message}`);
  // In production, integrate with a provider like Interakt, Wati, or Twilio WhatsApp API
  return { success: true, provider: "mock" };
}
