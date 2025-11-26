/// <reference types="astro/client"/>

import type { auth } from "@/server/auth";

declare global {
  namespace App {
    interface Locals {
      authSession: typeof auth.$Infer.Session | null;
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      readonly NODEMAILER_USER: string;
      readonly NODEMAILER_PASS: string;
      readonly BETTER_AUTH_SECRET: string;
      readonly ADMIN_EMAIL: string;
    }
  }

  interface ImportMetaEnv extends NodeJS.ProcessEnv {}

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
