import { MongoClient, GridFSBucket } from "mongodb";

export const PLACEMENT_DATABASE = "college_project";
export const PLACEMENT_REQUEST_COLLECTION = "placement_request";
export const PLACEMENT_PROFILE_BUCKET = "placement_profile";
export const EVENT_COLLECTION = "event";
export const EVENT_IMAGE_BUCKET = "event_image";
export const UPCOMING_COMPANY_COLLECTION = "upcoming_company";

export const client = new MongoClient("mongodb://localhost:27017");
export const db = client.db(PLACEMENT_DATABASE);
export const placementProfileBucket = new GridFSBucket(db, {
  bucketName: PLACEMENT_PROFILE_BUCKET,
});
export const eventImageBucket = new GridFSBucket(db, {
  bucketName: EVENT_IMAGE_BUCKET,
});
