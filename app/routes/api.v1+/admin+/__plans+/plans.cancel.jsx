import { authenticate, shopifyPlansNames } from "../../../../shopify.server";
import prisma from "../../../../db.server";

export const loader = async ({ request }) => {
  const { redirect, billing, session } = await authenticate.admin(request);

  const { hasActivePayment, appSubscriptions } = await billing.check({
    session: session,
    plans: shopifyPlansNames,
    isTest: process.env.PAYMENT_TEST === "true",
  });
  console.log("cancel plan", hasActivePayment, appSubscriptions);

  if (!hasActivePayment) {
    const subscription = appSubscriptions[0];
    await billing.cancel({
      subscriptionId: subscription.id,
      isTest: true,
      prorate: true,
    });
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        paid: false,
        subscription: null,
      },
    });
    await prisma.pageViews.update({
      where: { sessionId: session.id },
      data: {
        status: "INACTIVE",
        charge_id: null,
        expires_at: null,
        total_page_views: 0,
        available_page_views: 0,
        plans: {
          connect: {
            name: "Free",
          },
        },
      },
    });
  }
  return redirect("/app");
};
