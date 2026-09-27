import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  AgentInstructionTemplate,
  AgentTemplateInput,
  AgentTemplatePage,
  DeleteResponse,
} from "./types";

export async function getAgentTemplates(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  const { data } = await apiClient.get<AgentTemplatePage>(
    endpoints.agentTemplates.list,
    { params: { page, pageSize, ...(status === "deleted" ? { status } : {}) } },
  );
  return data;
}

export async function createAgentTemplate(input: AgentTemplateInput) {
  const { data } = await apiClient.post<{
    template: AgentInstructionTemplate;
  }>(endpoints.agentTemplates.list, input);
  return data;
}

export async function updateAgentTemplate(
  id: string,
  input: Partial<AgentTemplateInput>,
) {
  const { data } = await apiClient.patch<{
    template: AgentInstructionTemplate;
  }>(endpoints.agentTemplates.detail(id), input);
  return data;
}

export async function deleteAgentTemplate(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.agentTemplates.detail(id),
  );
  return data;
}

export async function restoreAgentTemplate(id: string) {
  const { data } = await apiClient.post<{
    template: AgentInstructionTemplate;
  }>(endpoints.agentTemplates.restore(id));
  return data;
}

export async function permanentlyDeleteAgentTemplate(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.agentTemplates.permanent(id),
  );
  return data;
}
