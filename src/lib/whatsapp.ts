export const getWhatsAppLink = (phone: string, message: string) => {
  const normalizedPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone.startsWith("91") ? normalizedPhone : "91" + normalizedPhone}?text=${encodedMessage}`;
};

export const sendWhatsApp = (phone: string, message: string) => {
  const link = getWhatsAppLink(phone, message);
  window.open(link, "_blank");
};

export const MESSAGES = {
  BIRTHDAY: (name: string) => 
    `Happy Birthday ${name}! 🎂 Wishing you a fantastic day filled with joy and success. Have a great year ahead! - Samarth Cricket Academy`,
  
  PAYMENT_APPROVED: (name: string, plan: string) => 
    `Hello ${name}, your payment for the ${plan} has been approved! 🏏 Your membership is now active. Welcome to the team!`,
  
  MEMBERSHIP_EXPIRY: (name: string, days: number) => 
    `Hello ${name}, your academy membership is expiring in ${days} days. ⏳ Please renew soon to continue your training without interruption.`,
  
  NOTICE_UPDATE: (title: string) => 
    `📢 NEW NOTICE: ${title}. Please check the academy app/website for more details.`,
};
