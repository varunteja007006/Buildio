export type Agent = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  instructions: string | null;
  status: "draft" | "deployed" | "undeployed";
  lastDeployedAt: string | null;
  createdBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentPage = {
  agents: Agent[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AgentInput = {
  name: string;
  description?: string;
  instructions?: string;
};

export type AgentTopic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type AgentToolbox = {
  id: string;
  name: string;
  toolKeys: string[];
};

export type AgentDetail = {
  agent: Agent;
  topics: AgentTopic[];
  tools: string[];
  toolboxes: AgentToolbox[];
};

export type AgentToolsInput = {
  toolKeys: string[];
  toolboxIds: string[];
};

export type AgentToolsResult = {
  toolKeys: string[];
  toolboxIds: string[];
  droppedToolKeys: string[];
};

export type AgentFeedbackEntry = {
  id: string;
  userId: string;
  userName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type AgentFeedbackResponse = {
  feedback: AgentFeedbackEntry[];
  total: number;
  average: number | null;
};

export type AgentFeedbackInput = {
  rating: number;
  comment?: string;
};

export type DeleteResponse = { success: boolean; id: string };
