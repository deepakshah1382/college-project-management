/// <reference types="astro/client"/>

import type { User, Session } from "better-auth";
import type { auth } from "@/server/auth";

declare global {
  declare namespace App {
    interface Locals {
      authSession: typeof auth.$Infer.Session;
    }
  }

  declare namespace NodeJS {
    interface ProcessEnv
      extends Readonly<{
        NODEMAILER_USER: string;
        NODEMAILER_PASS: string;
        BETTER_AUTH_SECRET: string;
        CONTACT_FORM_ADMIN_EMAIL: string;
      }> {}
  }
}
