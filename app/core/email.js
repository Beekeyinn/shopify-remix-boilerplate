import { createTransport } from "nodemailer";

export const EMAIL_TYPES = {
  INSTALLATION: "installation",
  UNINSTALLATION: "uninstallation",
  CONTACT_RESPONSE: "contact_response",
};

export const sendMail = ({
  to,
  subject,
  message = null,
  from = process.env.EMAIL_USERNAME,
  password = process.env.EMAIL_PASSWORD,
  cc = [],
  bcc = [],
  html = null,
}) => {
  const transportOptions = {
    service: "Gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_USE_TLS || true,
    auth: {
      user: from,
      pass: password,
    },
    tls: { rejectUnauthorized: true },
  };

  console.log("Email transport options: ", transportOptions);
  const transport = createTransport(transportOptions);
  transport.verify((err, success) => {
    if (err) {
      console.error("Failed to verify email", err);
      return "Failed to verify email";
    }
    if (success) {
      const _message = {
        from: from,
        to: to,
        subject: subject,
        cc: cc,
        bcc: bcc,
        envelope: {
          from: process.env.EMAIL_DEFAULT_FROM || from,
          to: to,
        },
      };
      if (html) {
        _message["html"] = html;
      }
      if (message) {
        _message["text"] = message;
      }
      console.log("Message Params: ", _message);
      transport.sendMail(_message, (err, info) => {
        if (err) {
          console.error("Error in sending mail: ", err);
          return "Failed to send mail";
        } else {
          console.log("Server responded with: ", info.response);
          console.log(
            "Message information: ",
            info.accepted,
            info.pending,
            info.rejected,
            info.envelope,
          );
          return "Message send successfully";
        }
      });
    }
  });
};
