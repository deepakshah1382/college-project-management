import { createAuthClient } from "better-auth/client";
import options from "./config";

export const client = createAuthClient(options);
