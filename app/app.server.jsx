import prisma from "./db.server";
import { JsonHttpExceptionError } from "./utils/errors";

export const handlePlanCreation = async (plan, billing, shop) => {
  // eslint-disable-next-line no-unused-vars
  const [plans, shopifyPlans] = await getPlansWithShopifyPlans();
  const domain = shop.replace(".myshopify.com", "");
  return billing.require({
    plans: plans,
    onFailure: async () =>
      billing.request({
        plan: plan.name,
        isTest: process.env.PAYMENT_TEST === "true",
        returnUrl: `https://admin.shopify.com/store/${domain}/apps/${process.env.APP_NAME}/app/plan/redirect`,
      }),
  });
};

export const checkPlan = async (plan_name) => {
  const plan = await prisma.plans.findUnique({
    where: {
      name: plan_name,
    },
  });
  if (plan === null) {
    throw new JsonHttpExceptionError({
      message: {
        detail: "Plan Does Not Exist.",
      },
      status: 404,
    });
  }
  return plan;
};

export const getPlansWithShopifyPlans = async () => {
  const plans = await prisma.plans.findMany({
    select: {
      name: true,
      price: true,
      trial_days: true,
      currency: true,
      interval: true,
    },
    orderBy: {
      price: "asc",
    },
  });
  const shopifyPlans = plans.map((data) => {
    return data.name;
  });
  return [plans, shopifyPlans];
};

export const validatePlan = (data) => {
  const check = data.hasOwnProperty("plan_name");
  if (!check) {
    throw new JsonHttpExceptionError({
      message: { plan_name: "This field is required." },
      status: 400,
    });
  }
  return check;
};
