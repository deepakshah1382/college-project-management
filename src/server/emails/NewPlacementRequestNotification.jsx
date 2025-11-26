import { Html } from "@react-email/components";

export default function NewPlacementRequestNotification({ data }) {
  return (
    <Html>
      <p>A new placement request was created by {data.name}.</p>
      <p>
        <span>Email: {data.email}</span>
        <br />
        <span>Stream: {data.stream}</span>
        <br />
        <span>Company: {data.company}</span>
        <br />
        <span>Designation: {data.designation}</span>
        <br />
        <span>Package: Rs. {data.package} LPA</span>
      </p>
    </Html>
  );
}
