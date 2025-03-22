import fs from "fs"
import dayjs from "dayjs"
import bcrypt from "bcrypt"
import utc from "dayjs/plugin/utc"
import nodemailer from "nodemailer"
import { randomUUID } from "crypto"

dayjs.extend(utc)

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt()
  const hashedPassword = await bcrypt.hash(password, salt)

  return hashedPassword
}

export const verifyPasswords = async (
  password: string,
  hashedPassword: string
) => {
  return bcrypt.compare(password, hashedPassword)
}

export const utcNow = async () => {
  return dayjs.utc().local()
}

export const generateHash = async (file: File) => {
  const fileContent = await file.arrayBuffer()
  const salt = await bcrypt.genSalt()
  const hash = await bcrypt.hash(fileContent.toString(), salt)
  return hash
}

export const generateFilename = (originalName: string) => {
  const fileName = randomUUID()
  const extension = originalName.split(".").pop()
  return `${fileName}.${extension}`
}

export const saveFile = async (file: File, filePath: string) => {
  // const filePath = path.join(settings.filesUrl, filename)
  const fileStream = fs.createWriteStream(filePath)
  fileStream.write(Buffer.from(await file.arrayBuffer()))
  fileStream.end()
}

export const generateCode = async ({ length }: { length: number }) => {
  let code = ""
  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10)
    code += digit.toString()
  }
  return code
}

export const sendEmail = async ({
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
