"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import type { AdminUserRow } from "@/lib/dashboard-data";
import { UserBlockButton } from "./user-block-button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDate, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  customer: "bg-info-light text-info",
  vendor: "bg-success-light text-success",
  admin: "bg-brand-light text-brand-dark",
};

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === "all" || user.role === role;
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      return matchesRole && matchesSearch;
    });
  }, [users, query, role]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border-custom bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-border-custom bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Filter by role"
          className="rounded-xl border border-border-custom bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <p className="text-sm text-text-secondary">
        Showing <strong className="text-text-primary">{filtered.length}</strong>{" "}
        of {users.length} users
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try a different search term or role filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-custom bg-surface shadow-sm">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-border-custom bg-brand-light/40 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Business / Plan</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {filtered.map((user) => {
                const isSelf = user.id === currentUserId;

                return (
                  <tr key={user.id} className="hover:bg-brand-light/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-xs font-semibold text-brand-dark">
                          {getInitials(user.name)}
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt=""
                              className="absolute inset-0 size-full object-cover"
                            />
                          ) : null}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text-primary">
                            {user.name}
                            {isSelf ? (
                              <span className="ml-1 text-xs font-normal text-text-muted">
                                (you)
                              </span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-text-secondary">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                          ROLE_STYLES[user.role] ??
                            "bg-muted text-text-secondary",
                        )}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      <p className="truncate">
                        {user.businessName || "—"}
                      </p>
                      {user.role === "vendor" ? (
                        <p className="mt-0.5 text-xs capitalize text-text-muted">
                          {user.subscriptionPlan} plan
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={user.isBlocked ? "blocked" : "active"}
                      />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <UserBlockButton
                          userId={user.id}
                          isBlocked={user.isBlocked}
                          isSelf={isSelf}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
