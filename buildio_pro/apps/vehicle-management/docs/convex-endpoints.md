## Convex delete endpoints

This document lists Convex mutations (and notable helpers) in `web/convex/` that perform deletion—either soft (mark records inactive / set deletedAt) or hard (permanently remove rows). For each entry I list: exported name, file, delete type (soft/hard), tables affected, who can call it, and short notes.

---

### Helper

- `softDelete(ctx, id, byUserId?)` — `web/convex/audit.ts`
  - Type: soft helper
  - Tables affected: any (patches the provided id)
  - Who: internal helper (used by mutations)
  - Notes: Centralized helper to set `isActive: false`, `deletedAt`, `deletedBy`, and update metadata.

---

### Mutations (soft deletes)

- `softDeleteUser` — `web/convex/appUser.ts`
  - Type: soft
  - Tables affected: `app_users`, `userRoles` (patched)
  - Who: callers with `admin` or `super` roles
  - Notes: Prevents self-deletion; also soft-deletes associated `userRoles` by patching them (sets `isActive: false`, `deletedAt`, etc.).

- `deleteUserDocuments` — `web/convex/documentUpload.ts`
  - Type: soft
  - Tables affected: `user_docs`
  - Who: document owner or `super` admin (checked per-document)
  - Notes: Soft-deletes one or many user documents; sets `isActive: false`, `deletedAt`, `deletedBy`, and returns deleted ids.

- `deleteVehicleDocument` — `web/convex/vehicleDocuments.ts`
  - Type: soft
  - Tables affected: `vehicle_docs`
  - Who: admin or super (checked in handler)
  - Notes: Sets `isActive: false`, `deletedAt`, `deletedBy`.
  - Also: `submitVehicleDocuments` soft-deletes existing docs of the same kind when inserting a new one.

- `deleteTripV1` — `web/convex/trip_v1.ts`
  - Type: soft
  - Tables affected: `trip_v1`
  - Who: admin or super
  - Notes: Patches `deletedAt`, `deletedBy`, `isActive: false`, plus updates metadata.

- `deleteTripType` — `web/convex/tripType.ts`
  - Type: soft
  - Tables affected: `trip_types`
  - Who: authenticated users (handler checks usage and active status; typically admin flows enforce permissions elsewhere)
  - Notes: Prevents deletion if in use by active trips; sets `isActive: false`, `deletedAt`, `deletedBy`.

- `deleteManufacturer` — `web/convex/vehicle.ts`
  - Type: soft
  - Tables affected: `vehicle_manufacturers`
  - Who: admin or super
  - Notes: Ensures there are no active models before deleting; patches metadata and `isActive`.

- `deleteModel` — `web/convex/vehicle.ts`
  - Type: soft
  - Tables affected: `vehicle_models`
  - Who: admin or super
  - Notes: Ensures no active vehicles reference the model; patches `isActive` and deletion metadata.

- `deleteVehicle` — `web/convex/vehicle.ts`
  - Type: soft
  - Tables affected: `vehicles`
  - Who: admin or super
  - Notes: Checks for non-completed trips before soft-delete; sets `isActive: false`, `deletedAt`, `deletedBy`.

- `deleteRoute` — `web/convex/route.ts`
  - Type: soft
  - Tables affected: `routes`
  - Who: authenticated users (route creator/admin flows enforced by app level)
  - Notes: Ensures no trips reference the route; sets `isActive: false`, `deletedAt`, `deletedBy`.

- `deleteRouteType` — `web/convex/routeType.ts`
  - Type: soft
  - Tables affected: `route_types`
  - Who: authenticated users
  - Notes: Prevents deleting default types or types used by active routes; patches `isActive`, `deletedAt`, `deletedBy`.

- `deleteCompany` — `web/convex/company.ts`
  - Type: soft
  - Tables affected: `companies`
  - Who: authenticated users (caller must be authenticated; higher-level role checks may apply)
  - Notes: Ensures no active subsidiaries exist; patches `isActive` and deletion metadata.

---

### Mutations (hard / permanent deletes)

- `permanentlyDeleteUserDocuments` — `web/convex/documentUpload.ts`
  - Type: hard (permanent)
  - Tables affected: `user_docs` (rows are permanently deleted)
  - Who: `super` admin only
  - Notes: Also attempts to delete file from storage via `ctx.storage.delete(fileId)` before `ctx.db.delete(documentId)`.

- `upsertUserRoles` (internal hard deletes of old role docs) — `web/convex/appUser.ts`
  - Type: hard (record-level deletes for roles)
  - Tables affected: `userRoles` (existing role docs are deleted)
  - Who: `admin` or `super` (this mutation itself requires admin/super)
  - Notes: The function removes existing role documents using `ctx.db.delete(r._id)` and inserts new role docs. This is a permanent delete of those role rows.

---

### Other notes / patterns observed

- Most deletions in the codebase use a soft-delete approach: setting `isActive: false` and stamping `deletedAt` / `deletedBy`. Queries typically filter `isActive` to exclude soft-deleted rows.
- Hard deletes are rare and only used in a few places: permanently removing user documents (for super admins) and removing role rows during role updates.
- Storage-level deletions (files) are performed via `ctx.storage.delete(...)` in `permanentlyDeleteUserDocuments`.

---

If you'd like, I can:
- Add missing caller-role details for any endpoint where you want explicit role coverage.
- Create a short checklist in each deletion mutation (e.g., confirm returned shape) or add links to the specific file/line.

Requirements coverage: this file enumerates all delete APIs found under `web/convex/` and marks each as soft or hard; if you'd like a CSV or to include line numbers, tell me and I'll add them.
# Convex Backend Endpoints

Last updated: 2025-09-28

This document inventories all Convex functions exported under `web/convex/`, grouped by module. Each item lists the function name, type, args (shape), and access notes.

Notes
- Unless stated otherwise, endpoints require the caller to be authenticated.
- "Admin/super" means the user must have `admin` or `super` role via `userRoles`.
- Function identifiers in the client follow `api.<module>.<exportName>` (module is the filename without extension).

---

## auth.ts
- loggedInUser — query(): Return current user's `{ appUser, user, userRoles, isAdminUser, isSuperUser, isDriverUser }`.

---

## audit.ts
- nowMs() — internal: Returns current timestamp in milliseconds.
- createRecord(ctx, table, doc) — internal helper: Inserts record with `createdAt`, `createdBy`, `isActive: true`.
- patchRecord(ctx, id, patch, byUserId?) — internal helper: Patches record with `updatedAt`, `updatedBy`.
- softDelete(ctx, id, byUserId?) — internal helper: Soft-deletes by setting `isActive: false`, `deletedAt`, `deletedBy`, `updatedAt/By`.
- restore(ctx, id, byUserId?) — internal helper: Restores by setting `isActive: true`, clearing `deletedAt/By`, updating `updatedAt/By`.

---

## auditAdmin.ts
- getAuditOperations — query(): Super only. Lists all audit operations.
- createAuditOperation — mutation({ code, name, description? }): Super only. Inserts new operation with uniqueness check.
- updateAuditOperation — mutation({ id, name?, description?, isActive? }): Super only. Patches operation fields.

---

## http.ts
- Default HTTP router: Wires up auth routes via `auth.addHttpRoutes(http)`.


---

## appUser.ts
- adminListUsers — query(): Admin/super. List all app_users with base `users` doc and roles.
- adminGetUser — query({ appUserId }): Admin/super. Get one app_user with base user, roles, and role flags.
- updateUserName — mutation({ name }): Authenticated. Update own `app_users.name`.
- upsertUserRoles — mutation({ targetAppUserId, roles: ("driver"|"admin"|"super")[] }): Admin/super. Replace role docs for target (hard deletes old roles).
- softDeleteUser — mutation({ targetAppUserId }): Admin/super. Soft-delete app_user and associated userRoles.

---

## utils.ts
- getAppUserFromUserIdQuery — query(): Authenticated. Returns { appUser, user, userRoles } for current user.
- hasRole(userRoles, role) — internal: Checks if user has specific active role.
- hasAnyRole(userRoles, roles[]) — internal: Checks if user has any of the roles.
- isAdmin(userRoles) — internal: True if has "admin" role.
- isSuper(userRoles) — internal: True if has "super" role.
- isDriver(userRoles) — internal: True if has "driver" role.

---

## bank.ts
- listUserBankDetails — query({ appUserId? }): Self; viewing others requires admin/super. List bank details rows.
- submitUserBankDetails — mutation({ userId?, account_number, account_holder_name, ifsc_code, branch_name, branch_address, branch_city, branch_pincode }): Self; submitting for others requires admin/super. Insert.
- updateUserBankDetails — mutation({ id, account_number?, account_holder_name?, ifsc_code?, branch_name?, branch_address?, branch_city?, branch_pincode? }): Owner or admin/super.

---

## company.ts
- createCompany — mutation({ name, contactPersonName?, contactPersonPhone?, contactPersonEmail?, addressLine1?, addressLine2?, city?, state?, pincode?, country?, companyRegistrationNumber?, gstNumber?, panNumber?, cinNumber?, companyType?, incorporationDate?, website?, parentCompanyId? }): Create with uniqueness checks (name/GST/PAN/registration); validates parent.
- updateCompany — mutation({ id, ...partial fields... }): Update; validates conflicts and circular parent chain.
- deleteCompany — mutation({ id }): Soft-delete; blocked if active subsidiaries exist.
- getCompanies — query({ includeInactive?, parentCompanyId?, limit? }): List with optional filters.
- getCompany — query({ id }): Get active company or null.
- getCompanyByName — query({ name }): Find active by name.
- getSubsidiaries — query({ parentCompanyId, includeInactive? }): Subsidiary list.
- getParentCompany — query({ companyId }): Parent or null.
- getCompanyHierarchy — query({ companyId }): Array from root down to company.
- searchCompanies — query({ searchTerm, includeInactive?, limit? }): Client-side filtered search across multiple fields.
- getCompanyStats — query({ companyId? }): Global or per-company stats.

---

## routeType.ts
- createRouteType — mutation({ name, description?, companyId? }): Create; unique per (companyId,name) scope; validates company.
- updateRouteType — mutation({ id, name?, description?, companyId? }): Update; prevents editing defaults; validates uniqueness and company.
- deleteRouteType — mutation({ id }): Soft-delete; prevents deleting defaults; blocked if active routes reference it.
- getRouteTypes — query({ includeInactive?, companyId?, includeDefaults?, limit? }): List; optionally merge defaults.
- getRouteType — query({ id }): Get active or null.
- getRouteTypeByName — query({ name, companyId? }): Active by scoped name.
- getDefaultRouteTypes — query({ includeInactive? }): List defaults.
- searchRouteTypes — query({ searchTerm, companyId?, includeInactive?, includeDefaults?, limit? }): Client-side filtered search.
- getRouteTypeStats — query({ routeTypeId?, companyId? }): Per-type or global aggregates.

---

## tripType.ts
- createTripType — mutation({ name, description?, sortBy? }): Authenticated. Creates trip type with uniqueness check on name/code; sets `isActive: true`.
- updateTripType — mutation({ id, name?, description?, sortBy? }): Authenticated. Updates active trip type; prevents updating deleted.
- deleteTripType — mutation({ id }): Authenticated. Soft-deletes if not used by active trips; checks usage in trip_v1.
- getTripTypes — query({ includeInactive?, limit? }): Lists trip types, optionally filtered by active and limited.
- getTripType — query({ id }): Returns active trip type or null.
- searchTripTypes — query({ searchTerm, limit? }): Client-side search on name.

---

## route.ts
- createRoute — mutation({ companyId, name, routeTypeId?, baseAmount, startLocation?, endLocation?, distance?, estimatedDuration? }): Create; validates uniqueness, foreign keys.
- updateRoute — mutation({ id, name?, routeTypeId?, baseAmount?, startLocation?, endLocation?, distance?, estimatedDuration?, withinState?, startState?, endState? }): Update with validations.
- deleteRoute — mutation({ id }): Soft-delete; blocked if any trips reference it.
- getRoutes — query({ includeInactive?, companyId?, routeTypeId?, withinState?, limit? }): Filtered list.
- getRouteWithDetails — query({ id }): Route with `routeType` and `company` objects.
- getRouteByName — query({ name, companyId }): Active by name within company.
- searchRoutes — query({ searchTerm, companyId?, routeTypeId?, includeInactive?, limit? }): Client-side filtered search.
- getRouteStats — query({ companyId?, routeTypeId? }): Aggregated metrics.

---

## vehicle.ts
- getManufacturers — query(): Active manufacturers.
- getAllManufacturersDebug — query(): All manufacturers (auth required).
- getModelsByManufacturer — query({ manufacturerId }): Active models for given manufacturer.
- getAllModelsWithManufacturer — query(): Active models joined with manufacturer.
- upsertManufacturer — mutation({ id?, name, country?, website? }): Admin/super. Create or update (unique name).
- upsertModel — mutation({ id?, manufacturerId, name, type, capacity?, fuelType?, engineSize?, year?, description? }): Admin/super. Create/update with uniqueness and FK checks.
- deleteManufacturer — mutation({ id }): Admin/super. Soft-delete; blocked if active models exist.
- deleteModel — mutation({ id }): Admin/super. Soft-delete; blocked if active vehicles exist.
- getVehicles — query(): Active vehicles.
- getVehicleById — query({ vehicleId }): Vehicle with model and manufacturer.

---

## trip_v1.ts
- createTripV1 — mutation({ date, companyId, routeId, touchPoint?, typeId, routeTypeId, vehicleId, driverId, tripId?, tripSheet?, cost? }): Admin/super. Inserts new trip_v1 record with joins validation.
- getTripV1 — query({ id }): Authenticated. Returns trip with joined company, route, driver, vehicle, tripType, routeType names.
- listTripV1 — query({ companyId?, driverId?, routeId?, routeTypeId?, typeId?, date?, startDate?, endDate?, limit? }): Authenticated. Filtered list using indexes where possible, with joined names.
- updateTripV1 — mutation({ id, patch: { date?, companyId?, ... } }): Admin/super. Patches allowed fields with updatedAt/By.
- deleteTripV1 — mutation({ id }): Admin/super. Soft-deletes by setting isActive: false, deletedAt/By.

---

## vehicleDocuments.ts
- generateUploadUrl — mutation(): Authenticated. Signed URL for uploads.
- submitVehicleDocuments — mutation({ vehicleId, docs: [{ kind, fileId, expiry? }, ...] }): Admin/super. Soft-deactivate existing same-kind, insert pending docs.
- getVehicleDocuments — query({ vehicleId }): Active docs with file metadata and download URL.
- getVehicleDocument — query({ documentId }): One doc with file and download URL (active only).
- deleteVehicleDocument — mutation({ documentId }): Admin/super soft delete.
- getExpiringVehicleDocuments — query({ daysAhead?=30 }): Admin/super. Upcoming expiries with vehicle and file details.

---

## documentUpload.ts (user documents)
- generateUploadUrl — mutation(): Signed URL for uploads.
- submitUserDocuments — mutation({ userId?, docs: [{ kind, fileId, expiry? }, ...] }): Self; checks duplicate kinds; inserts pending docs. If targeting another user, requires super role? (Code allows self; role check enforced on delete; upload uses auth and no role escalation beyond optional userId; typical usage is self.)
- deleteUserDocuments — mutation({ documentIds: [] }): Owner or super may soft-delete.
- permanentlyDeleteUserDocuments — mutation({ documentIds: [] }): Super only. Hard deletes user_docs rows and associated storage files via ctx.storage.delete.

---

## download.ts
- downloadUserDocumentsWithAudit — mutation({ documentIds: [], reason? }): Owner or super. Generates signed URLs for download; logs audit entry in audit_logs.
- downloadVehicleDocumentsWithAudit — mutation({ documentIds: [], reason? }): Super only. Generates signed URLs for vehicle docs; logs audit entry.

---

## documentList.ts (user documents)
- listUserDocuments — query({ appUserId? }): List docs for user; includes file URL and best-effort filename/contentType.
- getUserDocument — query({ documentId }): Owners or super.
- canDeleteDocuments — query({ documentIds: [] }): Per-ID permission and overall `canDeleteAll`.

---

## documentApproval.ts
- approveUserDocuments — mutation({ documentIds: [], status: "pending"|"approved"|"rejected", notes? }): Admin/super bulk review.
- approveVehicleDocuments — mutation({ documentIds: [], status, notes? }): Admin/super bulk review.
- getPendingUserDocuments — query({ limit?=50 }): Admin/super pending user docs with user+file and download URL.
- getPendingVehicleDocuments — query({ limit?=50 }): Admin/super pending vehicle docs with vehicle+file and download URL.
- getAllDocumentsWithApprovalStatus — query({ documentType: "user"|"vehicle", status?, limit?=100 }): Admin/super consolidated listing with approver and download URL.
- getDocumentApprovalStats — query(): Admin/super counts for pending/approved/rejected across user and vehicle docs.

---

## gps.ts
- logGpsPing — mutation({ lat, lng, tripId? }): Insert ping for provided trip or driver's active trip, if any.
- getLiveLocation — query({ tripId }): Latest ping for trip.
- getTripRoute — query({ tripId, limit? }): Asc-ordered pings up to limit.
- getCurrentLocation — query(): Latest ping for authenticated driver.

---

## trip.ts
- No active exports (all functions commented out): startTrip, endTrip, approveTrip, getTripDataForReport (placeholders).

---

## trip.ts
- No active exports (all functions commented out): startTrip, endTrip, approveTrip, getTripDataForReport (placeholders).

---

## payment.ts
- No active exports (all functions commented out): logManualPayment, makePaymentToDriver (placeholders).
