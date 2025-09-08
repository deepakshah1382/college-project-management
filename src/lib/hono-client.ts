import { hc } from "hono/client";
import type AppType from "@/server";

export const client = hc<typeof AppType>(
  typeof window !== "undefined"
    ? window.location.origin
    : "htpps://localhost:4321"
);
