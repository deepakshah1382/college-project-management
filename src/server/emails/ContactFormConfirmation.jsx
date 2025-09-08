import { Html } from "@react-email/components";

export default function ContactFormConfirmation({ name }) {
  return (
    <Html>
      <p>Hey, {name}! Your contact form was successfully submitted!</p>
      <p>We will reach you soon!</p>
    </Html>
  );
}
