import prisma from "../db.server";

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

  return { profile };
};
