import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  Agent,
  AgentDetail,
  AgentFeedbackInput,
  AgentFeedbackResponse,
  AgentInput,
  AgentPage,
  AgentToolsInput,
  AgentToolsResult,
  DeleteResponse,
} from "./types";

export async function getAgents(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  const { data } = await apiClient.get<AgentPage>(endpoints.agents.list, {
    params: { page, pageSize, ...(status === "deleted" ? { status } : {}) },
  });
  return data;
}

export async function getAgent(id: string) {
  const { data } = await apiClient.get<AgentDetail>(endpoints.agents.detail(id));
  return data;
}

export async function createAgent(input: AgentInput) {
  const { data } = await apiClient.post<{ agent: Agent }>(
    endpoints.agents.list,
    input,
  );
  return data;
}

export async function updateAgent(id: string, input: Partial<AgentInput>) {
  const { data } = await apiClient.patch<{ agent: Agent }>(
    endpoints.agents.detail(id),
    input,
  );
  return data;
}

export async function deleteAgent(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.agents.detail(id),
  );
  return data;
}

export async function restoreAgent(id: string) {
  const { data } = await apiClient.post<{ agent: Agent }>(
    endpoints.agents.restore(id),
  );
  return data;
}

export async function permanentlyDeleteAgent(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.agents.permanent(id),
  );
  return data;
}

export async function deployAgent(id: string) {
  const { data } = await apiClient.post<{ agent: Agent }>(
    endpoints.agents.deploy(id),
  );
  return data;
}

export async function undeployAgent(id: string) {
  const { data } = await apiClient.post<{ agent: Agent }>(
    endpoints.agents.undeploy(id),
  );
  return data;
}

export async function setAgentTopics(id: string, topicIds: string[]) {
  const { data } = await apiClient.put<{ topicIds: string[] }>(
    endpoints.agents.topics(id),
    { topicIds },
  );
  return data;
}

export async function detachAgentTopic(id: string, topicId: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.agents.topic(id, topicId),
  );
  return data;
}

export async function setAgentTools(id: string, input: AgentToolsInput) {
  const { data } = await apiClient.put<AgentToolsResult>(
    endpoints.agents.tools(id),
    input,
  );
  return data;
}

export async function detachAgentTool(id: string, toolKey: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.agents.tool(id, toolKey),
  );
  return data;
}

export async function detachAgentToolbox(id: string, toolboxId: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.agents.agentToolbox(id, toolboxId),
  );
  return data;
}

export async function getAgentFeedback(id: string) {
  const { data } = await apiClient.get<AgentFeedbackResponse>(
    endpoints.agents.feedback(id),
  );
  return data;
}

export async function upsertAgentFeedback(id: string, input: AgentFeedbackInput) {
  const { data } = await apiClient.put<{ feedback: unknown }>(
    endpoints.agents.feedback(id),
    input,
  );
  return data;
}
