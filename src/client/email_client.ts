import nodemailer from "nodemailer"

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

export interface EmailClient {
  sendPasswordResetEmail: (params: {
    recipient: string
    resetToken: string
  }) => Promise<void>
}

export function makeEmailClient(config: EmailConfig): EmailClient {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  })

  return {
    async sendPasswordResetEmail({ recipient, resetToken }) {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

      const mailOptions = {
        from: config.from,
        to: recipient,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hello ${recipient},</p>
            <p>You requested a password reset for your account. Click the link below to reset your password:</p>
            <p>
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>Your App Team</p>
          </div>
        `
      }

      await transporter.sendMail(mailOptions)
    }
  }
}
