import { ObjectId } from "mongodb";
import {
  db,
  placementProfileBucket,
  PLACEMENT_REQUEST_COLLECTION,
  PLACEMENT_PROFILE_BUCKET,
  UPCOMING_COMPANY_COLLECTION,
} from "../db";
import { Readable } from "node:stream";

export async function insertPlacementRequest({
  name,
  email,
  profile,
  stream,
  company,
  designation,
  package: packageValue,
  summary,
  joinedAt,
  userId,
}) {
  const profileStream = Readable.fromWeb(profile.stream());
  const uploadProfileStream = placementProfileBucket.openUploadStream(
    profile.name,
    {
      metadata: {
        contentType: profile.type,
      },
    }
  );
  profileStream.pipe(uploadProfileStream);

  await new Promise((resolve, reject) => {
    uploadProfileStream.once("finish", resolve);
    uploadProfileStream.once("error", reject);
  });

  return await db.collection(PLACEMENT_REQUEST_COLLECTION).insertOne({
    name,
    email,
    profile: new ObjectId(uploadProfileStream.id),
    stream,
    company,
    designation,
    package: packageValue,
    summary,
    user: new ObjectId(userId),
    createdAt: new Date(),
    joinedAt,
    status: "pending",
  });
}

export async function getPlacementRequests() {
  return await db
    .collection(PLACEMENT_REQUEST_COLLECTION)
    .aggregate([
      {
        $addFields: {
          id: {
            $toString: "$_id",
          },
          user: {
            $toString: "$user",
          },
          profile: {
            $toString: "$profile",
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();
}

export async function getPlacementRequestsByUserId(userId) {
  if (typeof userId !== "string") {
    throw new TypeError("Argument 'userId' must be a string");
  }

  return await db
    .collection(PLACEMENT_REQUEST_COLLECTION)
    .aggregate([
      {
        $match: {
          user: new ObjectId(userId),
        },
      },
      {
        $addFields: {
          id: {
            $toString: "$_id",
          },
          profile: {
            $toString: "$profile",
          },
        },
      },
      {
        $project: {
          _id: 0,
          user: 0,
        },
      },
    ])
    .toArray();
}

export async function getPlacementRequestById(requestId) {
  if (typeof requestId !== "string") {
    throw new TypeError("Argument 'requestId' must be a string");
  }

  return (
    (
      await db
        .collection(PLACEMENT_REQUEST_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: new ObjectId(requestId),
            },
          },
          {
            $limit: 1,
          },
          {
            $addFields: {
              id: {
                $toString: "$_id",
              },
              user: {
                $toString: "$user",
              },
              profile: {
                $toString: "$profile",
              },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ])
        .toArray()
    )[0] || null
  );
}

export async function getPlacementRequestByIdAndUserId(requestId, userId) {
  if (typeof requestId !== "string") {
    throw new TypeError("Argument 'requestId' must be a string");
  }

  if (typeof userId !== "string") {
    throw new TypeError("Argument 'userId' must be a string");
  }

  return (
    (
      await db
        .collection(PLACEMENT_REQUEST_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: new ObjectId(requestId),
              user: new ObjectId(userId),
            },
          },
          {
            $limit: 1,
          },
          {
            $addFields: {
              id: {
                $toString: "$_id",
              },
              profile: {
                $toString: "$profile",
              },
            },
          },
          {
            $project: {
              _id: 0,
              user: 0,
            },
          },
        ])
        .toArray()
    )[0] || null
  );
}

export async function getPlacementRequestProfileByProfileId(profileId) {
  if (typeof profileId !== "string") {
    throw new TypeError("Argument 'profileId' must be a string");
  }

  const profileObjectId = new ObjectId(profileId);

  const fileInfo = await db
    .collection(`${PLACEMENT_PROFILE_BUCKET}.files`)
    .findOne({
      _id: profileObjectId,
    });

  if (fileInfo) {
    const downloadProfileStream =
      placementProfileBucket.openDownloadStream(profileObjectId);

    return {
      ...fileInfo,
      stream: Readable.toWeb(downloadProfileStream),
    };
  }

  return null;
}

export async function getPlacementRequestProfileById(requestId) {
  const request = await getPlacementRequestById(requestId);

  if (request) {
    return await getPlacementRequestProfileByProfileId(request.profile);
  }

  return null;
}

export async function getPlacementRequestProfileByIdAndUserId(
  requestId,
  userId
) {
  const request = await getPlacementRequestByIdAndUserId(requestId, userId);

  if (request) {
    return await getPlacementRequestProfileByProfileId(request.profile);
  }

  return null;
}

export async function patchPlacementRequestById(requestId, { status }) {
  if (typeof requestId !== "string") {
    throw new TypeError("Argument 'requestId' must be a string");
  }

  if (typeof status !== "string") {
    throw new TypeError("Property 'status' must be a string");
  }

  if (!["approved", "declined", "pending"].includes(status)) {
    throw new Error(`Status ${status} is invalid`);
  }

  const res = await db.collection(PLACEMENT_REQUEST_COLLECTION).updateOne(
    {
      _id: new ObjectId(requestId),
    },
    {
      $set: { status },
    }
  );

  return res.acknowledged;
}

export async function getPlacedStudents({ limit } = {}) {
  if (limit === 0) {
    return [];
  }

  const aggregations = [
    {
      $match: {
        status: "approved",
      },
    },
    {
      $addFields: {
        id: {
          $toString: "$_id",
        },
      },
    },
    {
      $project: {
        _id: 0,
        user: 0,
        profile: 0,
        createdAt: 0,
        status: 0,
      },
    },
  ];

  if (typeof limit === "number" && limit >= 0) {
    aggregations.push({ $limit: limit });
  }

  return await db
    .collection(PLACEMENT_REQUEST_COLLECTION)
    .aggregate(aggregations)
    .toArray();
}

export async function getPlacedStudentProfile(id) {
  if (typeof id !== "string") {
    throw new TypeError("Argument 'id' must be a string");
  }

  const request = await getPlacementRequestById(id);

  if (request && request.status === "approved") {
    return await getPlacementRequestProfileByProfileId(request.profile);
  }

  return null;
}

export async function insertUpcomingCompany({
  name,
  date,
  location,
  requirements,
  salary,
}) {
  return await db.collection(UPCOMING_COMPANY_COLLECTION).insertOne({
    name,
    date,
    location,
    requirements,
    salary,
  });
}

export async function getUpcomingCompanies() {
  return await db
    .collection(UPCOMING_COMPANY_COLLECTION)
    .aggregate([
      {
        $addFields: {
          id: {
            $toString: "$_id",
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();
}
