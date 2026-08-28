/** A topic — top-level category (e.g. horror, romance) */
export type Topic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Input for creating a topic */
export type CreateTopicInput = {
  name: string;
  description?: string;
};

/** Input for renaming a topic */
export type RenameTopicInput = {
  name: string;
};

/** Response from GET /api/topics */
export type TopicsResponse = {
  topics: Topic[];
};

/** Response from POST /api/topics and PATCH /api/topics/:id */
export type TopicResponse = {
  topic: Topic;
};

/** Response from DELETE /api/topics/:id */
export type DeleteResponse = {
  success: true;
  id: string;
};

/** Error response shape used across topic/folder routes */
export type ApiError = {
  success: false;
  error: string;
};