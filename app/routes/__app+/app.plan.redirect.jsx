import { authenticate, shopifyPlansNames } from "../../shopify.server";
import prisma from "../../db.server";

export const loader = async ({ request }) => {
  const { billing, redirect, session } = await authenticate.admin(request);
  const { hasActivePayment, appSubscriptions } = await billing.check({
    session: session,
    plans: shopifyPlansNames,
    isTest: true,
  });
  if (hasActivePayment) {
    const { searchParams } = new URL(request.url);

    const charge_id = searchParams.get("charge_id");
    console.log("charge_id", charge_id);
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        paid: hasActivePayment,
        subscription: hasActivePayment && appSubscriptions[0],
      },
    });

    return redirect("/app");
  }
  return redirect("/app/plans");
};
