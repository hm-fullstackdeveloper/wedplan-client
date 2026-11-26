import { MongoClient } from "mongodb";

const uri = process.env.MONGO_CLIENT_DB_URL!;

// Development-এ hot reload হলেই নতুন MongoClient তৈরি হতো, ফলে
// অনেক connection জমে যেত। globalThis-এ cache করে সেটা আটকানো হচ্ছে।
const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
};

const client = globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
}

export default client;
