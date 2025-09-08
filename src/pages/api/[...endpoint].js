import app from "@/server";

export const prerender = false;

/** @type {import("astro").APIRoute} */
export const ALL = (context) => app.fetch(context.request, context);
