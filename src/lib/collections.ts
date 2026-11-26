import { ObjectId } from "mongodb";

import client from "@/app/lib/db";

/** পুরো project-এ একটাই business database। */
export const DB_NAME = "wedplan_project";

export function database() {
  return client.db(DB_NAME);
}

export function usersCollection() {
  return database().collection("user");
}

export function servicesCollection() {
  return database().collection("services");
}

export function bookingsCollection() {
  return database().collection("bookings");
}

export function transactionsCollection() {
  return database().collection("transactions");
}

/** Better Auth user.id হলো ObjectId-র hex string। */
export function toObjectId(value: string | null | undefined): ObjectId | null {
  if (!value || !ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

export function idsEqual(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}
