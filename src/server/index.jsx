import { Hono } from "hono";
import { auth } from "./auth";
import { zValidator } from "@hono/zod-validator";
import { success, z } from "zod";
import isEmail from "validator/lib/isEmail";
import { fromError } from "zod-validation-error";
import { transporter } from "./emails";
import { render } from "@react-email/components";
import ContactFormSubmission from "./emails/ContactFormSubmission";
import ContactFormConfirmation from "./emails/ContactFormConfirmation";
import { db, placementProfileBucket } from "./db";
import { ObjectId } from "mongodb";
import { Readable } from "node:stream";
import {
  getPlacementRequestById,
  getPlacementRequestByIdAndUserId,
  getPlacementRequestsByUserId,
} from "./utils/placement-details";

const ContactFormJsonSchema = z
  .object({
    name: z.string().min(3),
    email: z
      .string()
      .refine((value) => isEmail(value), { error: "Not a valid email" }),
    message: z.string().min(10),
  })
  .strict();

const UploadPlacementDetailsFormSchema = z
  .object({
    name: z.string().min(3),
    email: z
      .string()
      .refine((value) => isEmail(value), { error: "Not a valid email" }),
    profile: z
      .instanceof(File)
      .refine((value) => value.size <= 5 * 1024 * 1024, {
        error: "File size should not exceed 5MB",
      }),
    company: z.string().min(3),
    package: z.coerce.number().positive(),
    summary: z.string().min(100),
  })
  .strict();

async function userAuthorizedMiddleware(c, next) {
  const { authSession } = c.env.locals;

  if (!authSession) {
    return c.json(
      {
        error: "UNAUTHORIZED",
        message: "Unauthorized! Login and retry again!",
      },
      {
        status: 401,
      }
    );
  }

  await next();
}

const app = new Hono({
  strict: false,
})
  .all("/api/auth/*", async (c) => auth.handler(c.req.raw))
  .post(
    "/api/contact",
    zValidator("json", ContactFormJsonSchema, (result, c) => {
      if (!result.success) {
        const validationError = fromError(result.error);
        return c.json(
          {
            error: "INVALID_DATA",
            message: validationError.toString(),
          },
          { status: 400 }
        );
      }
    }),
    async (c, next) => {
      const { name, email, message } = c.req.valid("json");

      try {
        await transporter.sendMail({
          from: `"College Project" <${process.env.NODEMAILER_USER}>`,
          to: process.env.CONTACT_FORM_ADMIN_EMAIL,
          replyTo: email,
          subject: "New Contact Form Submission",
          html: await render(
            <ContactFormSubmission
              name={name}
              email={email}
              message={message}
            />
          ),
        });
      } catch (e) {
        console.error(e);

        return c.json(
          {
            error: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          },
          {
            status: 500,
          }
        );
      }

      try {
        await transporter.sendMail({
          from: `"College Project" <${process.env.NODEMAILER_USER}>`,
          to: email,
          subject: "Contact form submitted",
          html: await render(<ContactFormConfirmation name={name} />),
        });
      } catch (e) {}

      return c.json({
        success: true,
        message: "Form successfully submitted",
      });
    }
  )
  .post(
    "/api/placement-details",
    userAuthorizedMiddleware,
    zValidator("form", UploadPlacementDetailsFormSchema, (result, c) => {
      if (!result.success) {
        const validationError = fromError(result.error);
        return c.json(
          {
            error: "INVALID_DATA",
            message: validationError.toString(),
          },
          { status: 400 }
        );
      }
    }),
    async (c) => {
      const { authSession } = c.env.locals;
      const {
        name,
        email,
        profile,
        company,
        package: packageValue,
        summary,
      } = c.req.valid("form");

      try {
        const stream = Readable.fromWeb(profile.stream());
        const uploadStream = placementProfileBucket.openUploadStream(
          profile.name
        );
        stream.pipe(uploadStream);

        await new Promise((resolve, reject) => {
          uploadStream.once("finish", resolve);
          uploadStream.once("error", reject);
        });

        await db.collection("placement_request").insertOne({
          name,
          email,
          profile: new ObjectId(uploadStream.id),
          company,
          package: packageValue,
          summary,
          user: new ObjectId(authSession.user.id),
          createdAt: new Date(),
          status: "pending",
        });
      } catch (e) {
        console.error(e);

        return c.json(
          {
            error: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred. Try again later.",
          },
          {
            status: 500,
          }
        );
      }

      return c.json({
        success: true,
        message:
          "Your request was submitted! Have patience and wait for approval from admins.",
      });
    }
  )
  .get("/api/placement-details", userAuthorizedMiddleware, async (c) => {
    const { authSession } = c.env.locals;

    const requests = await getPlacementRequestsByUserId(authSession.user.id);

    console.log(requests[0]._id.toString());

    const firstRequest = await getPlacementRequestById(
      requests[0]._id.toString()
    );

    console.log(firstRequest);

    return c.json({
      success: true,
      data: requests,
    });
  })
  .get("/api/placement-details/:id", userAuthorizedMiddleware, async (c) => {
    const { authSession } = c.env.locals;

    const requestId = c.req.param("id");

    if (!ObjectId.isValid(requestId)) {
      return c.json(
        {
          error: "INVALID_REQUEST_ID",
          message: "Request Id is not valid",
        },
        {
          status: 400,
        }
      );
    }

    const request = await getPlacementRequestByIdAndUserId(
      requestId,
      authSession.user.id
    );

    return c.json({
      success: true,
      data: request,
    });
  });

export default app;
