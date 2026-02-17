import { Hono } from "hono";
import { auth } from "./auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import isEmail from "validator/lib/isEmail";
import { fromError } from "zod-validation-error";
import { transporter } from "./emails";
import { render } from "@react-email/components";
import ContactFormSubmission from "./emails/ContactFormSubmission";
import ContactFormConfirmation from "./emails/ContactFormConfirmation";
import NewPlacementRequestNotification from "./emails/NewPlacementRequestNotification";
import { ObjectId } from "mongodb";
import {
  getPlacedStudentProfile,
  getPlacedStudents,
  getPlacementRequestById,
  getPlacementRequestByIdAndUserId,
  getPlacementRequestProfileById,
  getPlacementRequestProfileByIdAndUserId,
  getPlacementRequests,
  getPlacementRequestsByUserId,
  getUpcomingCompanies,
  insertPlacementRequest,
  insertUpcomingCompany,
  patchPlacementRequestById,
} from "./utils/placement-details";
import {
  getEvents,
  getEventById,
  insertEvent,
  getEventImageByEventId,
} from "./utils/events";

const PastDateEpochSchema = z.coerce
  .number()
  .positive()
  .refine((epoch) => new Date().getTime() >= epoch, {
    error: "Date must be in past",
  })
  .transform((epoch) => new Date(epoch));

const FutureDateEpochSchema = z.coerce
  .number()
  .positive()
  .refine((epoch) => epoch > new Date().getTime(), {
    error: "Date must be in future",
  });

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
    name: z.string().trim().min(3).max(150),
    email: z
      .string()
      .refine((value) => isEmail(value), { error: "Not a valid email" }),
    profile: z
      .instanceof(File)
      .refine((value) => value.size <= 5 * 1024 * 1024, {
        error: "File size should not exceed 5MB",
      }),
    stream: z.enum([
      "bca",
      "bsc",
      "msc",
      "bcom",
      "mcom",
      "bba",
      "bed",
      "ba",
      "MBA",
    ]),
    company: z.string().trim().min(3).max(100),
    designation: z.string().trim().min(3).max(100),
    package: z.coerce.number().positive(),
    summary: z.string().trim().min(50).max(1500),
    joinedAt: PastDateEpochSchema,
  })
  .strict();

const PatchPlacementRequestStatusSchema = z
  .object({
    status: z.enum(["pending", "approved", "declined"]),
  })
  .strict();

const AddCompanySchema = z
  .object({
    name: z.string().min(3).max(100),
    date: FutureDateEpochSchema,
    location: z.string().min(3).max(300),
    requirements: z.string().min(3).max(1000),
    salary: z
      .array(z.number().positive())
      .length(2)
      .refine(([starting, ending]) => ending > starting, {
        error: "Ending salary must be greater than starting salary",
      }),
  })
  .strict();

const AddEventSchema = z
  .object({
    name: z.string().min(3).max(100),
    date: FutureDateEpochSchema,
    place: z.string().min(3).max(300),
    image: z.instanceof(File).refine((value) => value.size <= 5 * 1024 * 1024, {
      error: "File size should not exceed 5MB",
    }),
  })
  .strict();

async function userAuthorizedMiddleware(c, next) {
  const { authSession } = c.env.locals;

  if (!authSession) {
    return c.json(
      {
        code: "UNAUTHORIZED",
        error: "Unauthorized! Login and retry again!",
      },
      {
        status: 401,
      }
    );
  }

  await next();
}

async function adminAuthorizedMiddleware(c, next) {
  const { authSession } = c.env.locals;

  if (authSession.user.role !== "admin") {
    return c.json(
      {
        code: "UNAUTHORIZED",
        error: "You don't have rights to peform this action.",
      },
      {
        status: 403,
      }
    );
  }

  await next();
}

function handleInvalidSchema(result, c) {
  if (!result.success) {
    const validationError = fromError(result.error);
    return c.json(
      {
        code: "INVALID_DATA",
        error: validationError.toString(),
      },
      { status: 400 }
    );
  }
}

const app = new Hono({
  strict: false,
})
  .all("/api/auth/*", async (c) => auth.handler(c.req.raw))
  .post(
    "/api/contact",
    zValidator("json", ContactFormJsonSchema, handleInvalidSchema),
    async (c, next) => {
      const { name, email, message } = c.req.valid("json");

      try {
        await transporter.sendMail({
          from: `"College Project" <${import.meta.env.NODEMAILER_USER}>`,
          to: import.meta.env.ADMIN_EMAIL,
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
            code: "INTERNAL_SERVER_ERROR",
            error: "An unexpected error occurred",
          },
          {
            status: 500,
          }
        );
      }

      try {
        await transporter.sendMail({
          from: `"College Project" <${import.meta.env.NODEMAILER_USER}>`,
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
    zValidator("form", UploadPlacementDetailsFormSchema, handleInvalidSchema),
    async (c) => {
      const { authSession } = c.env.locals;
      const {
        name,
        email,
        profile,
        stream,
        company,
        designation,
        package: packageValue,
        summary,
        joinedAt,
      } = c.req.valid("form");

      const placementData = {
        name,
        email,
        profile,
        stream,
        company,
        designation,
        package: packageValue,
        summary,
        joinedAt,
        userId: authSession.user.id,
      };

      try {
        await insertPlacementRequest(placementData);
      } catch (e) {
        console.error(e);

        return c.json(
          {
            code: "INTERNAL_SERVER_ERROR",
            error: "An unexpected error occurred. Try again later.",
          },
          {
            status: 500,
          }
        );
      }

      try {
        await transporter.sendMail({
          from: `"College Project" <${import.meta.env.NODEMAILER_USER}>`,
          to: import.meta.env.ADMIN_EMAIL,
          replyTo: email,
          subject: "New Placement Request",
          html: await render(
            <NewPlacementRequestNotification data={placementData} />
          ),
        });
      } catch (e) {
        console.warn(e);
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

    const requests =
      authSession.user.role === "admin" && c.req.query("admin") !== "false"
        ? await getPlacementRequests()
        : await getPlacementRequestsByUserId(authSession.user.id);

    return c.json({ details: requests });
  })
  .get("/api/placement-details/:id", userAuthorizedMiddleware, async (c) => {
    const { authSession } = c.env.locals;

    const requestId = c.req.param("id");

    if (!ObjectId.isValid(requestId)) {
      return c.json(
        {
          code: "INVALID_REQUEST_ID",
          error: "Request Id is not valid",
        },
        {
          status: 400,
        }
      );
    }

    const request =
      authSession.user.role === "admin" && c.req.query("admin") !== "false"
        ? await getPlacementRequestById(requestId)
        : await getPlacementRequestByIdAndUserId(
            requestId,
            authSession.user.id
          );

    return c.json({
      detail: request,
    });
  })
  .patch(
    "/api/placement-details/:id",
    userAuthorizedMiddleware,
    adminAuthorizedMiddleware,
    zValidator("json", PatchPlacementRequestStatusSchema, handleInvalidSchema),
    async (c) => {
      const { status } = c.req.valid("json");
      const id = c.req.param("id");

      try {
        const updated = await patchPlacementRequestById(id, { status });

        return c.json({
          success: updated,
        });
      } catch (e) {
        console.warn(e);

        return c.json(
          {
            success: false,
          },
          {
            status: 400,
          }
        );
      }
    }
  )
  .get(
    "/api/placement-details/:id/profile",
    userAuthorizedMiddleware,
    async (c) => {
      const { authSession } = c.env.locals;

      const requestId = c.req.param("id");

      if (!ObjectId.isValid(requestId)) {
        return c.json(
          {
            code: "INVALID_REQUEST_ID",
            error: "Request Id is not valid",
          },
          {
            status: 400,
          }
        );
      }

      const fileData =
        authSession.user.role === "admin"
          ? await getPlacementRequestProfileById(requestId)
          : await getPlacementRequestProfileByIdAndUserId(
              requestId,
              authSession.user.id
            );

      if (fileData) {
        return c.body(fileData.stream, 200, {
          "Content-Type": fileData.metadata.contentType,
        });
      }

      return c.json(
        {
          code: "PROFILE_NOT_FOUND",
          error: "No profile with given request id was found.",
        },
        {
          status: 404,
        }
      );
    }
  )
  .get("/api/placed-students", async (c) => {
    const placedStudents = await getPlacedStudents();

    return c.json({
      placed: placedStudents,
    });
  })
  .get("/api/placed-students/:id/profile", async (c) => {
    const id = c.req.param("id");

    if (!ObjectId.isValid(id)) {
      return c.json(
        {
          code: "INVALID_REQUEST_ID",
          error: "Request Id is not valid",
        },
        {
          status: 400,
        }
      );
    }

    const fileData = await getPlacedStudentProfile(id);

    if (fileData) {
      return c.body(fileData.stream, 200, {
        "Content-Type": fileData.metadata.contentType,
      });
    }

    return c.json(
      {
        code: "PROFILE_NOT_FOUND",
        error: "No profile with given request id was found.",
      },
      {
        status: 404,
      }
    );
  })
  .post(
    "/api/upcoming-companies",
    userAuthorizedMiddleware,
    adminAuthorizedMiddleware,
    zValidator("json", AddCompanySchema, handleInvalidSchema),
    async (c) => {
      const { name, date, location, requirements, salary } =
        c.req.valid("json");

      try {
        await insertUpcomingCompany({
          name,
          date,
          location,
          requirements,
          salary,
        });
      } catch (e) {
        console.error(e);

        return c.json(
          {
            code: "INTERNAL_SERVER_ERROR",
            error: "An unexpected error occurred. Try again later.",
          },
          {
            status: 500,
          }
        );
      }

      return c.json({
        success: true,
        message: "An upcoming company was successfully added.",
      });
    }
  )
  .get("/api/upcoming-companies", async (c) => {
    try {
      const companies = await getUpcomingCompanies();

      return c.json({
        companies,
      });
    } catch (e) {
      console.error(e);

      return c.json(
        {
          code: "INTERNAL_SERVER_ERROR",
          error: "An unexpected error occurred. Try again later.",
        },
        {
          status: 500,
        }
      );
    }
  })
  .post(
    "/api/events",
    userAuthorizedMiddleware,
    adminAuthorizedMiddleware,
    zValidator("form", AddEventSchema, handleInvalidSchema),
    async (c) => {
      const { date, image, name, place } = c.req.valid("form");
      const eventData = {
        date,
        image,
        name,
        place,
      };

      try {
        await insertEvent(eventData);
      } catch (e) {
        console.error(e);

        return c.json(
          {
            code: "INTERNAL_SERVER_ERROR",
            error: "An unexpected error occurred. Try again later.",
          },
          {
            status: 500,
          }
        );
      }

      return c.json({
        success: true,
        message: "Event is successfully added.",
      });
    }
  )
  .get("/api/events", async (c) => {
    const events = await getEvents();

    return c.json({
      events,
    });
  })
  .get("/api/events/:id", async (c) => {
    const eventId = c.req.param("id");

    if (!ObjectId.isValid(eventId)) {
      return c.json(
        {
          code: "INVALID_REQUEST_ID",
          error: "Request Id is not valid",
        },
        {
          status: 400,
        }
      );
    }

    const event = await getEventById(eventId);

    return c.json({ event });
  })
  .get("/api/events/:id/image", async (c) => {
    const eventId = c.req.param("id");

    if (!ObjectId.isValid(eventId)) {
      return c.json(
        {
          code: "INVALID_REQUEST_ID",
          error: "Request Id is not valid",
        },
        {
          status: 400,
        }
      );
    }

    const fileData = await getEventImageByEventId(eventId);

    if (fileData) {
      return c.body(fileData.stream, 200, {
        "Content-Type": fileData.metadata.contentType,
      });
    }

    return c.json(
      {
        code: "Image_NOT_FOUND",
        error: "No image with given event id was found.",
      },
      {
        status: 404,
      }
    );
  });

export default app;
