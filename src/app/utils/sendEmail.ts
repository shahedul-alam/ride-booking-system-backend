import nodemailer from "nodemailer";
import ejs from "ejs";
import envVars from "../config/env";
import path from "path";
import AppError from "../errorHelpers/appError";

interface ISendEmail {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

const transporter = nodemailer.createTransport({
  host: envVars.SMTP.SMTP_HOST,
  port: envVars.SMTP.SMTP_PORT,
  secure: true,
  auth: {
    user: envVars.SMTP.SMTP_USER,
    pass: envVars.SMTP.SMTP_PASS,
  },
});

const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: ISendEmail) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: `"Jatra" <${envVars.SMTP.SMTP_FROM}>`,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    // eslint-disable-next-line no-console
    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    throw new AppError(401, "Email error");
  }
};

export default sendEmail;
