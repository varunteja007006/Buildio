import { createTRPCRouter } from "../init";
import {
  completeUpload,
  createUpload,
  deleteSupersededTransactions,
  deleteUpload,
  renameUpload,
} from "./statement.mutations";
import { processUpload } from "./statement.process";
import {
  getDownloadUrl,
  listExtractionModels,
  listStatements,
} from "./statement.queries";

export const statementRouter = createTRPCRouter({
  createUpload,
  completeUpload,
  renameUpload,
  listStatements,
  getDownloadUrl,
  listExtractionModels,
  processUpload,
  deleteUpload,
  deleteSupersededTransactions,
});
