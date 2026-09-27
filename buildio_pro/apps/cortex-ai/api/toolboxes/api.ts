import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  DeleteResponse,
  Toolbox,
  ToolboxDetail,
  ToolboxInput,
  ToolboxPage,
} from "./types";

export async function getToolboxes(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  const { data } = await apiClient.get<ToolboxPage>(endpoints.toolboxes.list, {
    params: { page, pageSize, ...(status === "deleted" ? { status } : {}) },
  });
  return data;
}

export async function getToolbox(id: string) {
  const { data } = await apiClient.get<ToolboxDetail>(
    endpoints.toolboxes.detail(id),
  );
  return data;
}

export async function createToolbox(input: ToolboxInput) {
  const { data } = await apiClient.post<{ toolbox: Toolbox }>(
    endpoints.toolboxes.list,
    input,
  );
  return data;
}

export async function updateToolbox(id: string, input: Partial<ToolboxInput>) {
  const { data } = await apiClient.patch<{ toolbox: Toolbox }>(
    endpoints.toolboxes.detail(id),
    input,
  );
  return data;
}

export async function deleteToolbox(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.toolboxes.detail(id),
  );
  return data;
}

export async function restoreToolbox(id: string) {
  const { data } = await apiClient.post<{ toolbox: Toolbox }>(
    endpoints.toolboxes.restore(id),
  );
  return data;
}

export async function permanentlyDeleteToolbox(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.toolboxes.permanent(id),
  );
  return data;
}

export async function setToolboxTools(id: string, toolKeys: string[]) {
  const { data } = await apiClient.put<{ toolKeys: string[] }>(
    endpoints.toolboxes.tools(id),
    { toolKeys },
  );
  return data;
}

export async function addToolboxTool(id: string, toolKey: string) {
  const { data } = await apiClient.post<{ toolKeys: string[] }>(
    endpoints.toolboxes.tools(id),
    { toolKeys: [toolKey] },
  );
  return data;
}

export async function removeToolboxTool(id: string, toolKey: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.toolboxes.tool(id, toolKey),
  );
  return data;
}
