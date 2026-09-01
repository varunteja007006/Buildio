import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { transactionTransfer } from "../schema/transfer.schema";

export const createTransactionTransferSchema =
  createInsertSchema(transactionTransfer);

export const selectTransactionTransferSchema =
  createSelectSchema(transactionTransfer);
