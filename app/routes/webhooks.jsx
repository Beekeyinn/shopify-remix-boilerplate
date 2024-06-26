import { authenticate } from "../shopify.server";
import db from "../db.server";
import { sendMail } from "../core/email";
import { getEmailTemplate } from "../core/templates";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      try {
        const profile = await db.profile.findUnique({
          where: {
            sessionId: session.id,
          },
        });
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
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;
    case "APP_SUBSCRIPTIONS_UPDATE":
      const charge_id = String(
        payload.app_subscription.admin_graphql_api_id,
      ).replace("gid://shopify/AppSubscription/", "");
      console.log("charge_id", charge_id, "\npayload: ", payload);
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
