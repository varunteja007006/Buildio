export type Toolbox = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on list responses; the detail endpoint uses `toolKeys` too. */
  toolKeys?: string[];
};

export type ToolboxPage = {
  toolboxes: Toolbox[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type ToolboxInput = {
  name: string;
  description?: string;
};

export type ToolboxDetail = {
  toolbox: Toolbox;
  toolKeys: string[];
};

export type DeleteResponse = { success: boolean; id: string };
