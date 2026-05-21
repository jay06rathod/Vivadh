const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
    await resend.emails.send({
        from: 'Vivadh <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your Vivadh account',
        html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                <h2 style="color: #f0ece4; background: #0a0a0a; padding: 24px; margin: 0;">Vivadh</h2>
                <div style="padding: 24px; background: #111; border: 1px solid #2a2a2a;">
                    <p style="color: #bbb; font-size: 14px;">Your verification code:</p>
                    <h1 style="color: #f0ece4; font-size: 48px; letter-spacing: 8px; margin: 16px 0;">${otp}</h1>
                    <p style="color: #555; font-size: 12px;">Expires in 10 minutes. Don't share this with anyone.</p>
                </div>
            </div>
        `
    });
};

module.exports = { sendOTPEmail };