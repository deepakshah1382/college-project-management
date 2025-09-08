import { ObjectId } from "mongodb";
import { db } from "../db";

export const PLACEMENT_REQUEST_COLLECTION = "placement_request";

export async function getPlacementRequestsByUserId(userId) {
  if (typeof userId !== "string") {
    throw new TypeError("Argument 'userId' must be a string");
  }

  return await db
    .collection(PLACEMENT_REQUEST_COLLECTION)
    .find({
      user: new ObjectId(userId),
    })
    .toArray();
}

export async function getPlacementRequestById(requestId) {
  if (typeof requestId !== "string") {
    throw new TypeError("Argument 'requestId' must be a string");
  }

  return await db.collection(PLACEMENT_REQUEST_COLLECTION).findOne({
    _id: new ObjectId(requestId),
  });
}

export async function getPlacementRequestByIdAndUserId(requestId, userId) {
  if (typeof requestId !== "string") {
    throw new TypeError("Argument 'requestId' must be a string");
  }

  if (typeof userId !== "string") {
    throw new TypeError("Argument 'userId' must be a string");
  }

  return await db.collection(PLACEMENT_REQUEST_COLLECTION).findOne({
    _id: new ObjectId(requestId),
    user: new ObjectId(userId),
  });
}
