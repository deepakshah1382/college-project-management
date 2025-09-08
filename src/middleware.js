import { defineMiddleware } from "astro:middleware";
import { auth } from "@/server/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.authSession = await auth.api.getSession({
    headers: context.request.headers,
  });

  return next();
});
