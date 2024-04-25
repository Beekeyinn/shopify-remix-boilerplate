import { authenticate } from "../../../../shopify.server";

export const loader = async ({ request, params }) => {
  const {
    billing,
    session: { shop },
  } = await authenticate.admin(request);
  // const plan = await checkPlan(params.planName);
  // await handlePlanCreation(plan, billing, shop);
  const domain = shop.replace(".myshopify.com", "");
  const { planName } = params;

  await billing.request({
    plan: planName,
    isTest: process.env.PAYMENT_TEST === "true",
    returnUrl: `https://admin.shopify.com/store/${domain}/apps/${process.env.APP_NAME}/app/plan/redirect`,
  });
  return null;
};
