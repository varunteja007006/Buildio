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

crons.interval(
  "prune old chats",
  { minutes: 60 }, // every hour
  api.cleanup.deleteOldChats,
);

crons.interval(
  "prune old scribble canvases",
  { minutes: 60 }, // every hour
  api.cleanup.deleteOldScribbleLines,
);

export default crons;
