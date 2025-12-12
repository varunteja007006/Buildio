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

export const deleteOldChats = mutation(async ({ db }) => {
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours ago

  const chats = await db.query("chats").collect();
  for (const chat of chats) {
    if (chat.created_at && chat.created_at < cutoff) {
      await db.delete(chat._id);
    }
  }
});

export const deleteOldScribbleLines = mutation(async ({ db }) => {
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours ago

  const lines = await db.query("scribble_lines").collect();
  for (const line of lines) {
    const ts = line.updated_at ?? line.created_at ?? 0;
    if (ts && ts < cutoff) {
      await db.delete(line._id);
    }
  }
});
