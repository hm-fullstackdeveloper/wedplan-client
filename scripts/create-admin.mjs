/**
 * Trusted server-side Admin creation.
 *
 * Public signup কখনো admin তৈরি করে না। Admin বানানোর একমাত্র
 * নিরাপদ উপায় এই script — যেটা সার্ভারে (terminal-এ) চালাতে হয়।
 *
 * ব্যবহার:
 *   node scripts/create-admin.mjs --email admin@wedplan.com --password "StrongPass123!" --name "WedPlan Admin"
 */

import fs from "node:fs";
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "better-auth/crypto";

function readEnv(file) {
  const text = fs.readFileSync(file, "utf8");
  const out = {};

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      out[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }

  return out;
}

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

const email = (getArg("email") || "").trim().toLowerCase();
const password = getArg("password") || "";
const name = (getArg("name") || "WedPlan Admin").trim();

if (!email || !password) {
  console.error(
    'Usage: node scripts/create-admin.mjs --email admin@wedplan.com --password "StrongPass123!" [--name "WedPlan Admin"]',
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const env = readEnv(".env");
const uri = env.MONGO_CLIENT_DB_URL;

if (!uri) {
  console.error("MONGO_CLIENT_DB_URL not found in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("wedplan_project");

  const existing = await db.collection("user").findOne({ email });

  if (existing) {
    console.error(
      `A user with ${email} already exists (role: ${existing.role}). Use a different email.`,
    );
    process.exit(1);
  }

  const userId = new ObjectId();
  const now = new Date();

  await db.collection("user").insertOne({
    _id: userId,
    name,
    email,
    emailVerified: true,
    image: null,
    role: "admin",
    isBlocked: false,
    businessName: "",
    subscriptionPlan: "free",
    subscriptionExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const hashed = await hashPassword(password);

  await db.collection("account").insertOne({
    _id: new ObjectId(),
    accountId: String(userId),
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  });

  console.log("Admin account created successfully.");
  console.log(`  Email   : ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  User ID : ${userId}`);
  console.log("");
  console.log("Sign in at /sign-in and choose the Admin option.");
} finally {
  await client.close();
}
