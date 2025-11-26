import { MongoClient, GridFSBucket } from "mongodb";

export const PLACEMENT_DATABASE = "college_project";
export const PLACEMENT_REQUEST_COLLECTION = "placement_request";
export const PLACEMENT_PROFILE_BUCKET = "placement_profile";
export const UPCOMING_COMPANY_COLLECTION = "upcoming_company";

export const client = new MongoClient("mongodb://localhost:27017");
export const db = client.db(PLACEMENT_DATABASE);
export const placementProfileBucket = new GridFSBucket(db, {
  bucketName: PLACEMENT_PROFILE_BUCKET,
});
