import {
  bookingsCollection,
  servicesCollection,
  toObjectId,
  transactionsCollection,
  usersCollection,
} from "./collections";

type Doc = Record<string, unknown>;

function firstImage(images: unknown): string | null {
  if (Array.isArray(images)) {
    const first = images.find((item) => typeof item === "string" && item);
    return typeof first === "string" ? first : null;
  }

  if (typeof images === "string" && images) {
    return images;
  }

  return null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asDateString(value: unknown): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export type BookingRow = {
  id: string;
  status: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  createdAt: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string | null;
  servicePrice: number | null;
  serviceCategory: string;
  vendorId: string;
  vendorName: string;
  vendorBusinessName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
};

async function joinBookings(docs: Doc[]): Promise<BookingRow[]> {
  if (docs.length === 0) {
    return [];
  }

  const serviceIds = docs
    .map((doc) => toObjectId(String(doc.serviceId ?? "")))
    .filter((id): id is NonNullable<typeof id> => id !== null);

  const userIds = docs.flatMap((doc) => [
    toObjectId(String(doc.vendorId ?? "")),
    toObjectId(String(doc.customerId ?? "")),
  ]);

  const validUserIds = userIds.filter(
    (id): id is NonNullable<typeof id> => id !== null,
  );

  const [services, users] = await Promise.all([
    serviceIds.length
      ? servicesCollection().find({ _id: { $in: serviceIds } }).toArray()
      : Promise.resolve([]),
    validUserIds.length
      ? usersCollection().find({ _id: { $in: validUserIds } }).toArray()
      : Promise.resolve([]),
  ]);

  const serviceMap = new Map(
    services.map((service) => [String(service._id), service]),
  );
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return docs.map((doc) => {
    const service = serviceMap.get(String(doc.serviceId ?? ""));
    const vendor = userMap.get(String(doc.vendorId ?? ""));
    const customer = userMap.get(String(doc.customerId ?? ""));

    return {
      id: String(doc._id),
      status: asString(doc.status, "pending"),
      eventDate: asDateString(doc.eventDate),
      eventLocation: asString(doc.eventLocation),
      message: asString(doc.message),
      createdAt: asDateString(doc.createdAt),
      serviceId: String(doc.serviceId ?? ""),
      serviceName: asString(service?.serviceName, "Service removed"),
      serviceImage: firstImage(service?.images),
      servicePrice: asNumber(service?.price),
      serviceCategory: asString(service?.category),
      vendorId: String(doc.vendorId ?? ""),
      vendorName: asString(vendor?.name, "Vendor"),
      vendorBusinessName: asString(vendor?.businessName),
      customerId: String(doc.customerId ?? ""),
      customerName: asString(customer?.name, "Customer"),
      customerEmail: asString(customer?.email),
    };
  });
}

export async function getCustomerBookings(customerId: string) {
  const oid = toObjectId(customerId);

  if (!oid) {
    return [] as BookingRow[];
  }

  const docs = await bookingsCollection()
    .find({ customerId: oid })
    .sort({ createdAt: -1 })
    .toArray();

  return joinBookings(docs as Doc[]);
}

export async function getAllBookings() {
  const docs = await bookingsCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return joinBookings(docs as Doc[]);
}

export async function getVendorBookings(vendorId: string) {
  const oid = toObjectId(vendorId);

  if (!oid) {
    return [] as BookingRow[];
  }

  const docs = await bookingsCollection()
    .find({ vendorId: oid })
    .sort({ createdAt: -1 })
    .toArray();

  return joinBookings(docs as Doc[]);
}

export type BookingCounts = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
};

async function countByStatus(
  match: Record<string, unknown>,
): Promise<BookingCounts> {
  const grouped = await bookingsCollection()
    .aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();

  const counts: BookingCounts = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
  };

  for (const row of grouped) {
    const status = String(row._id ?? "").toLowerCase();
    const count = Number(row.count ?? 0);
    counts.total += count;

    if (status === "pending") counts.pending += count;
    if (status === "accepted") counts.accepted += count;
    if (status === "rejected") counts.rejected += count;
    if (status === "cancelled") counts.cancelled += count;
  }

  return counts;
}

export function getCustomerBookingCounts(customerId: string) {
  const oid = toObjectId(customerId);
  return countByStatus(oid ? { customerId: oid } : { customerId: null });
}

export function getVendorBookingCounts(vendorId: string) {
  const oid = toObjectId(vendorId);
  return countByStatus(oid ? { vendorId: oid } : { vendorId: null });
}

export type ServiceRow = {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number | null;
  location: string;
  images: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  vendorId: string;
  vendorName: string;
  vendorBusinessName: string;
  vendorEmail: string;
};

function mapService(service: Doc, vendor?: Doc): ServiceRow {
  const images = Array.isArray(service.images)
    ? service.images.filter((item): item is string => typeof item === "string")
    : typeof service.images === "string" && service.images
      ? [service.images]
      : [];

  return {
    id: String(service._id),
    serviceName: asString(service.serviceName, "Untitled service"),
    category: asString(service.category),
    description: asString(service.description),
    price: asNumber(service.price),
    location: asString(service.location),
    images,
    status: asString(service.status, "pending"),
    isActive: service.isActive !== false,
    createdAt: asDateString(service.createdAt),
    vendorId: String(service.vendorId ?? ""),
    vendorName: asString(vendor?.name, "Vendor"),
    vendorBusinessName: asString(vendor?.businessName),
    vendorEmail: asString(vendor?.email),
  };
}

export async function getVendorServices(vendorId: string) {
  const oid = toObjectId(vendorId);

  if (!oid) {
    return [] as ServiceRow[];
  }

  const [services, vendor] = await Promise.all([
    servicesCollection()
      .find({ vendorId: oid })
      .sort({ createdAt: -1 })
      .toArray(),
    usersCollection().findOne({ _id: oid }),
  ]);

  return services.map((service) => mapService(service as Doc, vendor as Doc));
}

export async function getVendorService(vendorId: string, serviceId: string) {
  const vendorOid = toObjectId(vendorId);
  const serviceOid = toObjectId(serviceId);

  if (!vendorOid || !serviceOid) {
    return null;
  }

  const [service, vendor] = await Promise.all([
    servicesCollection().findOne({ _id: serviceOid, vendorId: vendorOid }),
    usersCollection().findOne({ _id: vendorOid }),
  ]);

  if (!service) {
    return null;
  }

  return mapService(service as Doc, vendor as Doc);
}

export async function getAdminServices() {
  const services = await servicesCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const vendorIds = services
    .map((service) => toObjectId(String(service.vendorId ?? "")))
    .filter((id): id is NonNullable<typeof id> => id !== null);

  const vendors = vendorIds.length
    ? await usersCollection().find({ _id: { $in: vendorIds } }).toArray()
    : [];

  const vendorMap = new Map(vendors.map((vendor) => [String(vendor._id), vendor]));

  return services.map((service) =>
    mapService(
      service as Doc,
      vendorMap.get(String(service.vendorId ?? "")) as Doc | undefined,
    ),
  );
}

export type VendorStats = {
  totalServices: number;
  activeServices: number;
  approvedServices: number;
  pendingServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  subscriptionPlan: string;
};

export async function getVendorStats(
  vendorId: string,
  subscriptionPlan: string | null | undefined,
): Promise<VendorStats> {
  const oid = toObjectId(vendorId);

  if (!oid) {
    return {
      totalServices: 0,
      activeServices: 0,
      approvedServices: 0,
      pendingServices: 0,
      pendingBookings: 0,
      acceptedBookings: 0,
      subscriptionPlan: subscriptionPlan || "free",
    };
  }

  const [totalServices, activeServices, approvedServices, pendingServices, bookingCounts] =
    await Promise.all([
      servicesCollection().countDocuments({ vendorId: oid }),
      servicesCollection().countDocuments({
        vendorId: oid,
        status: "approved",
        isActive: true,
      }),
      servicesCollection().countDocuments({ vendorId: oid, status: "approved" }),
      servicesCollection().countDocuments({ vendorId: oid, status: "pending" }),
      getVendorBookingCounts(vendorId),
    ]);

  return {
    totalServices,
    activeServices,
    approvedServices,
    pendingServices,
    pendingBookings: bookingCounts.pending,
    acceptedBookings: bookingCounts.accepted,
    subscriptionPlan: subscriptionPlan || "free",
  };
}

export type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  totalTransactions: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [totalUsers, totalVendors, totalCustomers, totalServices, pendingServices, totalTransactions] =
    await Promise.all([
      usersCollection().countDocuments({}),
      usersCollection().countDocuments({ role: "vendor" }),
      usersCollection().countDocuments({ role: "customer" }),
      servicesCollection().countDocuments({}),
      servicesCollection().countDocuments({ status: "pending" }),
      transactionsCollection().countDocuments({}),
    ]);

  return {
    totalUsers,
    totalVendors,
    totalCustomers,
    totalServices,
    pendingServices,
    totalTransactions,
  };
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  businessName: string;
  subscriptionPlan: string;
  image: string | null;
  createdAt: string;
};

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const users = await usersCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return users.map((user) => ({
    id: String(user._id),
    name: asString(user.name, "WedPlan user"),
    email: asString(user.email),
    role: asString(user.role, "customer"),
    isBlocked: user.isBlocked === true,
    businessName: asString(user.businessName),
    subscriptionPlan: asString(user.subscriptionPlan, "free"),
    image: typeof user.image === "string" ? user.image : null,
    createdAt: asDateString(user.createdAt),
  }));
}

export type TransactionRow = {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorBusinessName: string;
  vendorEmail: string;
  plan: string;
  amount: number | null;
  currency: string;
  status: string;
  stripeSessionId: string;
  stripeSubscriptionId: string;
  createdAt: string;
};

export async function getAdminTransactions(): Promise<TransactionRow[]> {
  const transactions = await transactionsCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const vendorIds = transactions
    .map((transaction) => toObjectId(String(transaction.vendorId ?? "")))
    .filter((id): id is NonNullable<typeof id> => id !== null);

  const vendors = vendorIds.length
    ? await usersCollection().find({ _id: { $in: vendorIds } }).toArray()
    : [];

  const vendorMap = new Map(vendors.map((vendor) => [String(vendor._id), vendor]));

  return transactions.map((transaction) => {
    const vendor = vendorMap.get(String(transaction.vendorId ?? ""));

    return {
      id: String(transaction._id),
      vendorId: String(transaction.vendorId ?? ""),
      vendorName: asString(vendor?.name, "Vendor"),
      vendorBusinessName: asString(vendor?.businessName),
      vendorEmail: asString(vendor?.email),
      plan: asString(transaction.plan, "premium"),
      amount: asNumber(transaction.amount),
      currency: asString(transaction.currency, "usd"),
      status: asString(transaction.status, "pending"),
      stripeSessionId: asString(transaction.stripeSessionId),
      stripeSubscriptionId: asString(transaction.stripeSubscriptionId),
      createdAt: asDateString(transaction.createdAt),
    };
  });
}
