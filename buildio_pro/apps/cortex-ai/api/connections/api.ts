import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

import type {
  Connection,
  ConnectionInput,
  ConnectionPage,
  ConnectorTable,
  DeleteResponse,
  ProbeResult,
} from "./types";

export async function getConnections(
  page: number,
  pageSize: number,
  status: "active" | "deleted" = "active",
) {
  const { data } = await apiClient.get<ConnectionPage>(
    endpoints.connections.list,
    { params: { page, pageSize, ...(status === "deleted" ? { status } : {}) } },
  );
  return data;
}

export async function getConnection(id: string) {
  const { data } = await apiClient.get<{ connection: Connection }>(
    endpoints.connections.detail(id),
  );
  return data;
}

export async function testConnection(input: ConnectionInput) {
  const { data } = await apiClient.post<ProbeResult>(
    endpoints.connections.test,
    input,
  );
  return data;
}

export async function createConnection(input: ConnectionInput) {
  const { data } = await apiClient.post<{ connection: Connection }>(
    endpoints.connections.list,
    input,
  );
  return data;
}

export async function updateConnection(
  id: string,
  input: Partial<ConnectionInput>,
) {
  const { data } = await apiClient.patch<{ connection: Connection }>(
    endpoints.connections.detail(id),
    input,
  );
  return data;
}

export async function checkConnection(id: string) {
  const { data } = await apiClient.post<{
    connection: Connection;
    probe: ProbeResult;
  }>(endpoints.connections.check(id));
  return data;
}

export async function deleteConnection(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.connections.detail(id),
  );
  return data;
}

export async function restoreConnection(id: string) {
  const { data } = await apiClient.post<{ connection: { id: string } }>(
    endpoints.connections.restore(id),
  );
  return data;
}

export async function getConnectorTables(id: string) {
  const { data } = await apiClient.get<{ tables: ConnectorTable[] }>(
    endpoints.connections.tables(id),
  );
  return data;
}

export async function permanentlyDeleteConnection(id: string) {
  const { data } = await apiClient.delete<DeleteResponse>(
    endpoints.connections.permanent(id),
  );
  return data;
}
