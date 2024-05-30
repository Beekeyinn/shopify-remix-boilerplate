import prisma from "../db.server";
import { sendMail } from "./email";
import { getEmailTemplate } from "./templates";

export const afterInstallationJob = async (session, data, plan) => {
  const [first_name, last_name] = data.shop_owner.split(" ");

  const profile = await prisma.profile.upsert({
    where: { sessionId: session.id },
    create: {
      sessionId: session.id,
      first_name: first_name,
      last_name: last_name,
      email: data.email,
      country: data.country,
      phone_number: data.phone_number,
      shop_name: data.name,
    },
    update: {},
  });
  try {
    const templateContext = getEmailTemplate({
      path: "views/emails/html/installation.hbs",
      data: {
        name: `${profile.first_name} ${profile.last_name}`,
      },
    });
    sendMail({
      to: profile.email,
      subject: "Welcome to Entangle",
      html: templateContext,
    });
  } catch (err) {
    console.error("Error while sending Installation email", err);
  }
  await prisma.settings.create({ data: { logrocket_key: "" } });

  return { profile };
};
