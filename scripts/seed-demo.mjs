/**
 * Demo data for the three dashboards.
 *
 * সব demo document-এ `seed: "demo-v1"` marker থাকে, তাই
 * `--clean` দিলে শুধু demo data মুছে যায় — আসল data নয়।
 *
 * ব্যবহার:
 *   node scripts/seed-demo.mjs
 *   node scripts/seed-demo.mjs --clean
 */

import fs from "node:fs";
import { MongoClient, ObjectId } from "mongodb";

const SEED = "demo-v1";
const HERO_IMAGE = "/images/hero-wedding-floral.jpg";

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

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
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

  if (process.argv.includes("--clean")) {
    const [services, bookings, transactions] = await Promise.all([
      db.collection("services").deleteMany({ seed: SEED }),
      db.collection("bookings").deleteMany({ seed: SEED }),
      db.collection("transactions").deleteMany({ seed: SEED }),
    ]);

    console.log("Demo data removed.");
    console.log(`  services     : ${services.deletedCount}`);
    console.log(`  bookings     : ${bookings.deletedCount}`);
    console.log(`  transactions : ${transactions.deletedCount}`);
    process.exit(0);
  }

  const vendors = await db
    .collection("user")
    .find({ role: "vendor" })
    .sort({ createdAt: 1 })
    .toArray();

  const customers = await db
    .collection("user")
    .find({ role: "customer" })
    .sort({ createdAt: 1 })
    .toArray();

  if (vendors.length === 0 || customers.length === 0) {
    console.error(
      "Need at least one vendor and one customer in the database first.",
    );
    process.exit(1);
  }

  // পুরোনো demo data সরিয়ে fresh seed।
  await Promise.all([
    db.collection("services").deleteMany({ seed: SEED }),
    db.collection("bookings").deleteMany({ seed: SEED }),
    db.collection("transactions").deleteMany({ seed: SEED }),
  ]);

  // Existing user-দের missing security/subscription field পূরণ।
  await db
    .collection("user")
    .updateMany({ isBlocked: { $exists: false } }, { $set: { isBlocked: false } });
  await db
    .collection("user")
    .updateMany(
      { subscriptionPlan: { $exists: false } },
      { $set: { subscriptionPlan: "free" } },
    );

  const vendor = (index) => vendors[index % vendors.length];
  const customer = (index) => customers[index % customers.length];

  const serviceDefs = [
    {
      v: 0,
      serviceName: "Royal Garden Wedding Hall",
      category: "Wedding Hall",
      description:
        "A luxurious garden venue with indoor and outdoor ceremony spaces, seating for 400 guests, and a dedicated bridal suite.",
      price: 2500,
      location: "Gulshan, Dhaka",
      status: "approved",
      isActive: true,
    },
    {
      v: 0,
      serviceName: "Golden Lens Photography",
      category: "Photography",
      description:
        "Full-day wedding photography with two photographers, 500+ edited photos, and a private online gallery for the couple.",
      price: 900,
      location: "Dhanmondi, Dhaka",
      status: "approved",
      isActive: true,
    },
    {
      v: 0,
      serviceName: "Blush Bridal Makeup",
      category: "Makeup Artist",
      description:
        "Premium bridal makeup package including trial session, HD makeup, hair styling, and touch-up support on the wedding day.",
      price: 450,
      location: "Chattogram",
      status: "pending",
      isActive: true,
    },
    {
      v: 0,
      serviceName: "Elegant Floral Decor",
      category: "Decoration",
      description:
        "Complete floral decoration for stage, entrance and guest tables. This submission is a demo of a rejected service.",
      price: 1200,
      location: "Dhaka",
      status: "rejected",
      isActive: false,
    },
    {
      v: 1,
      serviceName: "Sunset Rooftop Venue",
      category: "Wedding Hall",
      description:
        "An intimate rooftop venue for up to 150 guests with skyline views, fairy lights, and an in-house event coordinator.",
      price: 1800,
      location: "Banani, Dhaka",
      status: "approved",
      isActive: true,
    },
    {
      v: 1,
      serviceName: "Candid Wedding Films",
      category: "Videography",
      description:
        "Cinematic wedding videography with a highlight film, full ceremony edit, and drone coverage for outdoor events.",
      price: 1100,
      location: "Dhaka",
      status: "approved",
      isActive: true,
    },
    {
      v: 2,
      serviceName: "Spice Route Catering",
      category: "Catering",
      description:
        "Multi-cuisine wedding catering with live counters, dessert station, and professional service staff for large events.",
      price: 1500,
      location: "Uttara, Dhaka",
      status: "approved",
      isActive: true,
    },
    {
      v: 2,
      serviceName: "Harmony Music & DJ",
      category: "Music & DJ",
      description:
        "Professional DJ and sound system for wedding receptions, including MC service, dance-floor lighting, and playlist planning.",
      price: 700,
      location: "Dhaka",
      status: "approved",
      isActive: true,
    },
  ];

  const serviceDocs = serviceDefs.map((def, index) => {
    const owner = vendor(def.v);

    return {
      _id: new ObjectId(),
      vendorId: owner._id,
      serviceName: def.serviceName,
      category: def.category,
      description: def.description,
      price: def.price,
      location: def.location,
      images: [HERO_IMAGE],
      status: def.status,
      isActive: def.isActive,
      createdAt: daysAgo(20 - index * 2),
      updatedAt: daysAgo(20 - index * 2),
      seed: SEED,
    };
  });

  await db.collection("services").insertMany(serviceDocs);

  const approved = serviceDocs.filter((service) => service.status === "approved");

  const bookingDefs = [
    {
      service: 0,
      customer: 0,
      eventDate: "2026-12-20",
      eventLocation: "Gulshan, Dhaka",
      message:
        "We would love to book the garden hall for our December wedding. Please confirm availability.",
      status: "pending",
      days: 2,
    },
    {
      service: 1,
      customer: 1,
      eventDate: "2027-01-15",
      eventLocation: "Dhanmondi, Dhaka",
      message:
        "Looking for full-day photography coverage. Do you also provide a printed album?",
      status: "accepted",
      days: 5,
    },
    {
      service: 4,
      customer: 0,
      eventDate: "2026-12-05",
      eventLocation: "Banani, Dhaka",
      message: "We are interested in a rooftop ceremony for 120 guests.",
      status: "rejected",
      days: 8,
    },
    {
      service: 6,
      customer: 1,
      eventDate: "2027-02-10",
      eventLocation: "Uttara, Dhaka",
      message: "Please share your catering menu options for a 200-guest wedding.",
      status: "cancelled",
      days: 12,
    },
    {
      service: 5,
      customer: 0,
      eventDate: "2027-03-01",
      eventLocation: "Dhaka",
      message: "We need cinematic videography with drone coverage.",
      status: "pending",
      days: 1,
    },
    {
      service: 7,
      customer: 1,
      eventDate: "2027-03-18",
      eventLocation: "Dhaka",
      message: "We want a DJ for the reception and a playlist consultation.",
      status: "accepted",
      days: 4,
    },
  ];

  const bookingDocs = bookingDefs.map((def) => {
    const service = approved[def.service] ?? approved[0];
    const customerDoc = customer(def.customer);

    return {
      _id: new ObjectId(),
      serviceId: service._id,
      vendorId: service.vendorId,
      customerId: customerDoc._id,
      eventDate: def.eventDate,
      eventLocation: def.eventLocation,
      message: def.message,
      status: def.status,
      createdAt: daysAgo(def.days),
      updatedAt: daysAgo(def.days),
      seed: SEED,
    };
  });

  await db.collection("bookings").insertMany(bookingDocs);

  const transactionDocs = vendors.slice(0, 3).map((owner, index) => {
    const status = index === 0 ? "paid" : index === 1 ? "pending" : "failed";

    return {
      _id: new ObjectId(),
      vendorId: owner._id,
      plan: "premium",
      amount: 19,
      currency: "usd",
      stripeSessionId: `demo_seed_${status}_${String(owner._id)}`,
      stripeSubscriptionId: status === "paid" ? `demo_sub_${String(owner._id)}` : "",
      status,
      createdAt: daysAgo(index * 3 + 1),
      seed: SEED,
    };
  });

  if (transactionDocs.length) {
    await db.collection("transactions").insertMany(transactionDocs);
  }

  console.log("Demo data seeded successfully.");
  console.log(`  vendors used     : ${Math.min(vendors.length, 3)}`);
  console.log(`  customers used   : ${Math.min(customers.length, 2)}`);
  console.log(`  services         : ${serviceDocs.length}`);
  console.log(`  bookings         : ${bookingDocs.length}`);
  console.log(`  transactions     : ${transactionDocs.length}`);
  console.log("");
  console.log("Remove later with: node scripts/seed-demo.mjs --clean");
} finally {
  await client.close();
}
