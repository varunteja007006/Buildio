export type AgentInstructionTemplate = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  body: string;
  createdBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentTemplatePage = {
  templates: AgentInstructionTemplate[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AgentTemplateInput = {
  name: string;
  description?: string;
  body: string;
};

export type DeleteResponse = { success: boolean; id: string };
