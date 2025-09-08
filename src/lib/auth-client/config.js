import { emailOTPClient, adminClient } from "better-auth/client/plugins";

/** @satisfies {import("better-auth/client").ClientOptions} */
const options = {
  plugins: [adminClient(), emailOTPClient()],
};

export default options;
