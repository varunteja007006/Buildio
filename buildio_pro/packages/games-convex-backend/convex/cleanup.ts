import { mutation } from "./_generated/server";

export const deleteStaleStories = mutation(async ({ db }) => {
  const now = Date.now();
  const cutoff = now - 60 * 60 * 1000; // 1 hour ago

  const stories = await db.query("stories").withIndex("created_at").collect();

  for (const story of stories) {
    if (story.status === "started" && story.created_at < cutoff) {
      await db.delete(story._id);
    }
  }
});

export const clearStoriesAndPoints = mutation(async ({ db }) => {
  const stories = await db.query("stories").collect();
  await Promise.all(stories.map((story) => db.delete(story._id)));

  const storyPoints = await db.query("storyPoints").collect();
  await Promise.all(storyPoints.map((point) => db.delete(point._id)));
});
