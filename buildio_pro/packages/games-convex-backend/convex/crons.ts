import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear staled stories",
  { minutes: 60 }, // every 60 minutes
  api.cleanup.deleteStaleStories,
);

crons.interval(
  "clear stories and points",
  { minutes: 30240 }, // every 3 weeks (21 days)
  api.cleanup.clearStoriesAndPoints,
);

export default crons