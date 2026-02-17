import { ObjectId } from "mongodb";
import {
  db,
  EVENT_COLLECTION,
  EVENT_IMAGE_BUCKET,
  eventImageBucket,
} from "../db";
import { Readable } from "node:stream";

export async function insertEvent({ name, date, place, image }) {
  const imageStream = Readable.fromWeb(image.stream());
  const uploadImageStream = eventImageBucket.openUploadStream(image.name, {
    metadata: {
      contentType: image.type,
    },
  });
  imageStream.pipe(uploadImageStream);

  await new Promise((resolve, reject) => {
    uploadImageStream.once("finish", resolve);
    uploadImageStream.once("error", reject);
  });

  return await db.collection(EVENT_COLLECTION).insertOne({
    name,
    date,
    image: new ObjectId(uploadImageStream.id),
    place,
  });
}

export async function getEvents() {
  return await db
    .collection(EVENT_COLLECTION)
    .aggregate([
      {
        $addFields: {
          id: {
            $toString: "$_id",
          },
          image: {
            $toString: "$image",
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

export async function getEventById(eventId) {
  if (typeof eventId !== "string") {
    throw new TypeError("Argument 'requestId' must be a string");
  }

  return (
    (
      await db
        .collection(EVENT_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: new ObjectId(eventId),
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
              image: {
                $toString: "$image",
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

export async function getEventImageByImageId(imageId) {
  if (typeof imageId !== "string") {
    throw new TypeError("Argument 'profileId' must be a string");
  }

  const imageObjectId = new ObjectId(imageId);

  const fileInfo = await db.collection(`${EVENT_IMAGE_BUCKET}.files`).findOne({
    _id: imageObjectId,
  });

  if (fileInfo) {
    const downloadImageStream =
      eventImageBucket.openDownloadStream(imageObjectId);

    return {
      ...fileInfo,
      stream: Readable.toWeb(downloadImageStream),
    };
  }

  return null;
}

export async function getEventImageByEventId(eventId) {
  if (typeof eventId !== "string") {
    throw new TypeError("Argument 'requestId' must be a string");
  }

  const event = await getEventById(eventId);

  if (event) {
    return await getEventImageByImageId(event.image);
  }

  return null;
}
