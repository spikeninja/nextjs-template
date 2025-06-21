import { Resend } from "resend"
import nodemailer from "nodemailer"

export const sendEmailSMTP = async ({
  to,
  subject,
  html,
  config,
}: {
  to: string
  html: string
  subject: string
  config: {
    port: number
    host: string
    auth: {
      email: string
      pass: string
    }
  }
}) => {
  const sendOptions = {
    port: config.port,
    host: config.host,
    auth: {
      user: config.auth.email,
      pass: config.auth.pass,
    },
  }
  const transporter = nodemailer.createTransport(sendOptions)

  const info = await transporter.sendMail({
    to,
    html,
    subject,
    from: sendOptions.auth.user,
  })
  console.log("Email Sent: ", info)
}

export const sendEmailResend = async ({
  to,
  from,
  subject,
  html,
  resendToken,
}: {
  to: string
  from: string
  html: string
  subject: string
  resendToken: string
}) => {
  const resend = new Resend(resendToken)
  const { data, error } = await resend.emails.send({
    from,
    html,
    to: [to],
    subject,
  })

  if (error) {
    return console.error({ error })
  }

  console.log({ data })
}
