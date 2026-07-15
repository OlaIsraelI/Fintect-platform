const { Resend } = require("resend");

// Replace with your actual API key
const resend = new Resend("....................");

async function sendTestEmail() {
  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "olaisraeliri@gmail.com",
      subject: "Test Email from FinTech",
      html: "<h1>Hello!</h1><p>This is a test email from your FinTech platform.</p>",
    });
    console.log("✅ Email sent successfully!", result);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

sendTestEmail();
