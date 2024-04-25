import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import prisma from "../../db.server";
import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";
import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";
import { authenticate } from "../../shopify.server";

import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const user = await prisma.session.findUnique({
    where: {
      id: session.id,
    },
    include: {
      Profile: true,
    },
  });
  let settings = await prisma.settings.findFirst();

  if (settings === null) {
    settings = {
      logrocket: false,
      logrocket_key: "",
      crisp: false,
    };
  }

  return json({
    user: user,
    settings: settings,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function App() {
  const { apiKey, settings, user } = useLoaderData();

  useEffect(() => {
    const name = user?.profile
      ? `${user.profile.first_name} ${user.profile.last_name}`
      : user.shop;
    if (typeof window !== "undefined" && settings.logrocket) {
      LogRocket.init(settings.logrocket_key);
      LogRocket.identify(user.id, {
        name: name,
        email: user?.profile?.email ?? user.shop,
      });
      setupLogRocketReact(LogRocket);
    }

    user.profile && Crisp.user.setEmail(user.profile.email);
    user.profile && Crisp.user.setNickname(name);

    Crisp.configure(settings.crisp_key, {
      autoload: user.paid && settings.crisp,
    });
  }, []);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/plan">Plans</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
