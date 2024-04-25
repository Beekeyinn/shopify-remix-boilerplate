import { json } from "@remix-run/node";
import prisma from "../../../../db.server";
import { authenticate } from "../../../../shopify.server";

export const loader = async ({ request }) => {
   const { session } = await authenticate.admin(request);
   const sessionD = await prisma.session.findUnique({
      where: {
         id: session.id,
      },
      select: {
         shop: true,
         paid: true,
         subscription: true,
         Profile: true,
      },
   });
   return json({ session: sessionD, success: true });
};
