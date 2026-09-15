import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  DeleteResponse,
  ExtractionTemplate,
  TemplateInput,
  TemplatePage,
} from "./types";

export async function getExtractionTemplates(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  const { data } = await apiClient.get<TemplatePage>(
    endpoints.extractionTemplates.list,
    { params: { page, pageSize, ...(status === "deleted" ? { status } : {}) } },
  );
  return data;
}

export async function createExtractionTemplate(input: TemplateInput) {
  const { data } = await apiClient.post<{ template: ExtractionTemplate }>(
    endpoints.extractionTemplates.list,
    input,
  );
  return data;
}

export async function updateExtractionTemplate(
  id: string,
  input: Partial<TemplateInput>,
) {
  const { data } = await apiClient.patch<{ template: ExtractionTemplate }>(
    endpoints.extractionTemplates.detail(id),
    input,
  );
  return data;
}

export async function deleteExtractionTemplate(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.extractionTemplates.detail(id),
  );
  return data;
}

export async function restoreExtractionTemplate(id: string) {
  const { data } = await apiClient.post<{ template: ExtractionTemplate }>(
    endpoints.extractionTemplates.restore(id),
  );
  return data;
}

export async function permanentlyDeleteExtractionTemplate(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.extractionTemplates.permanent(id),
  );
  return data;
}
