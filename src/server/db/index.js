import { MongoClient, GridFSBucket } from "mongodb";

export const client = new MongoClient("mongodb://localhost:27017");
export const db = client.db("college_project");
export const placementProfileBucket = new GridFSBucket(db, {
  bucketName: "placement_profile",
});
