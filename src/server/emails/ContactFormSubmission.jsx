import { Html } from "@react-email/components";

export default function ContactFormSubmission({ name, email, message }) {
  return (
    <Html>
      <p>New Contact form submission</p>
      <p>
        <span>
          <b>Name</b>:
        </span>
        <br />
        <span>{name}</span>
      </p>
      <p>
        <span>
          <b>Email</b>:
        </span>
        <br />
        <span>{email}</span>
      </p>
      <p>
        <span>
          <b>Message</b>:
        </span>
        <br />
        <span>{message}</span>
      </p>
    </Html>
  );
}
