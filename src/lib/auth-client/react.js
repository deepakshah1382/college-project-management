import { createAuthClient } from "better-auth/react";
import options from "./config";

export const client = createAuthClient(options);
