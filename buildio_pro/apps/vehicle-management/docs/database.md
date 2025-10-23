# Database

**Roles**

- `driver`
- `admin`
- `super`

**TripStatus**

- `Placed`
- `In-Progress`
- `In-Transit`
- `Destination`
- `Completed`
- `Closed`

`TripFileDocuments`

- `StartGatePass`
- `EndGatePass`

**UserDocKind**

- Aadhar
- PAN
- Driver License
- Bank Passbook

**VehicleDocKind**

- `VehicleRC`
- `Insurance`
- `Permit`
- `Fitness`
- `PollutionCertificate`
- `TaxDocument`
- `GoodsPermit`
- `NationalPermit`

**VehicleType**

- `car`
- `truck`
- `maxi-cab`
- `van`
- `bus`
- `motocycle`
- `pickup`
- `suv`

**PaymentMethod**

- `manual`
- `bulk`
- `external`

Table - `app_users`

| column_name |                | optional | index       |
| ----------- | -------------- | -------- | ----------- |
| `userId`    | id             |          | `by_userId` |
| `email`     | string         | ✅       | `by_email`  |
| `name`      | string         | ✅       |             |
| `balance`   | number         | ✅       |             |
| `createdAt` | date           |          |             |
| `createdBy` | id `app_users` | ✅       |             |
| `updatedAt` | date           | ✅       |             |
| `updatedBy` | id `app_users` | ✅       |             |
| `isActive`  | boolean        | ✅       |             |
| `deletedAt` | date           | ✅       |             |
| `deletedBy` | id `app_users` | ✅       |             |

###

Table - `userRoles`

| column_name |                      | optional | index       |
| ----------- | -------------------- | -------- | ----------- |
| `userId`    | id `app_users`       |          | `by_userId` |
| `role`      | `driver/admin/super` |          | `by_email`  |
| `createdAt` | date                 |          |             |
| `createdBy` | id `app_users`       | ✅       |             |
| `updatedAt` | date                 | ✅       |             |
| `updatedBy` | id `app_users`       | ✅       |             |
| `isActive`  | boolean              | ✅       |             |
| `deletedAt` | date                 | ✅       |             |
| `deletedBy` | id `app_users`       | ✅       |             |
