import assert from "node:assert/strict";

import {
  isLikelySensitiveColumn,
  redactSampleValues,
} from "./description-safety";

assert.equal(isLikelySensitiveColumn("customer_email"), true);
assert.equal(isLikelySensitiveColumn("api_key"), true);
assert.equal(isLikelySensitiveColumn("order_total"), false);
assert.equal(
  redactSampleValues("Email is alice@example.com", [
    { rows: [{ email: "alice@example.com" }] },
  ]),
  "Email is [sample value omitted]",
);
assert.equal(
  redactSampleValues("Account 928371", [{ rows: [{ id: 928371 }] }]),
  "Account [sample value omitted]",
);
