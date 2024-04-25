import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Box,
  Button,
  Card,
  DescriptionList,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate, Plans } from "../../shopify.server";
import prisma from "../../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const user = await prisma.session.findUnique({ where: { id: session.id } });
  return json({
    user: user,
    plans: Plans,
  });
};

export default function PlansComponent() {
  const {
    plans,
    user: { paid, subscription },
  } = useLoaderData();
  // eslint-disable-next-line no-unused-vars
  const submit = useSubmit();

  const updatePlan = (plan_name) => {
    submit(
      {},
      {
        method: "GET",
        action: `/api/v1/admin/plans/${plan_name}/create`,
        replace: false,
      },
    );
  };

  const cancelPlan = () => {
    submit(
      {},
      { replace: true, method: "GET", action: "/api/v1/admin/plans/cancel" },
    );
  };

  return (
    <Page fullWidth>
      <Box width="100%" id="horizontal-center">
        <InlineStack gap="2" wrap={true}>
          {plans.map((item, _) => {
            return (
              <Box key={_} width="33%">
                <Card roundedAbove="sm">
                  <Text as="h2" variant="headingLg">
                    {item.name}
                  </Text>
                  <DescriptionList
                    items={[
                      { term: "Price", description: item.amount },
                      { term: "Trial Days", description: item.trialDays },
                    ]}
                  />
                  <Button
                    onClick={() =>
                      paid && subscription.name == item.name
                        ? cancelPlan()
                        : updatePlan(item.name)
                    }
                  >
                    {paid && subscription.name == item.name
                      ? "Cancel"
                      : "Subscribe"}
                  </Button>
                </Card>
              </Box>
            );
          })}
        </InlineStack>
      </Box>
    </Page>
  );
}
