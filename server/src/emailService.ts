import nodemailer from "nodemailer";

interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create transporter based on environment
const createTransporter = () => {
  let config: EmailConfig;

  if (process.env.NODE_ENV === "production") {
    // Production: Use Brevo SMTP
    if (process.env.BREVO_SMTP_KEY && process.env.EMAIL_FROM) {
      config = {
        host: "smtp-relay.sendinblue.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_FROM, // Your Brevo login email
          pass: process.env.BREVO_SMTP_KEY,
        },
      };
      if (process.env.NODE_ENV !== "production") {
        console.log("✅ Email service configured with Brevo SMTP");
      }
    } else {
      throw new Error(
        "Brevo SMTP credentials not found in production environment"
      );
    }
  } else {
    // Development: Use Brevo SMTP for testing (same config)
    if (process.env.BREVO_SMTP_KEY && process.env.EMAIL_FROM) {
      config = {
        host: "smtp-relay.sendinblue.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.BREVO_SMTP_KEY,
        },
      };
      console.log("✅ Email service configured with Brevo SMTP (development)");
    } else {
      // Fallback to Ethereal for development
      config = {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || "ethereal.user@ethereal.email",
          pass: process.env.EMAIL_PASS || "ethereal.password",
        },
      };
      console.log("⚠️  Development mode: Using Ethereal Email (test emails)");
    }
  }

  return nodemailer.createTransport(config);
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: "system@venkat.codes",
    to: email,
    subject: "Reset Your Second Brain Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Second Brain</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🧠 Second Brain</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">We received a request to reset the password for your Second Brain account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; border-left: 4px solid #667eea; padding-left: 15px; margin: 20px 0;">
            <strong>Security Note:</strong> This link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 13px; margin: 0;">
              Can't click the button? Copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>This email was sent by Second Brain. If you have questions, please contact support.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== "production") {
      console.log("Password reset email sent successfully");
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendWelcomeEmail = async (email: string, firstName?: string) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: "system@venkat.codes",
    to: email,
    subject: "Welcome to Second Brain! 🧠",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Second Brain</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🧠 Welcome to Second Brain!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${
            firstName || "there"
          }! 👋</h2>
          <p style="font-size: 16px; color: #555;">Thank you for joining Second Brain! Your account has been successfully created and you're ready to start building your digital knowledge base.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do with Second Brain:</h3>
            <ul style="color: #555; padding-left: 20px;">
              <li>📚 Store and organize articles, videos, and links</li>
              <li>🏷️ Tag your content for easy discovery</li>
              <li>📝 Add markdown notes to any content</li>
              <li>🔍 Search through your knowledge base</li>
              <li>🔗 Share your brain publicly with others</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Start Building Your Brain
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Need help getting started? Check out our <a href="${
              process.env.CLIENT_URL
            }" style="color: #667eea;">documentation</a> or reply to this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>Happy organizing! 🚀<br>The Second Brain Team</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== "production") {
      console.log("Welcome email sent successfully");
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error for welcome email, it's not critical
  }
};
