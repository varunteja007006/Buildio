export const endpoints = {
  chat: {
    stream: "/chat",
    threads: "/chat/threads",
    thread: (id: string) => `/chat/threads/${id}`,
    threadRestore: (id: string) => `/chat/threads/${id}/restore`,
    models: "/chat/models",
    preferences: "/chat/preferences",
  },
  resources: {
    list: "/resources",
    detail: (id: string) => `/resources/${id}`,
  },
  workspaces: {
    list: "/workspaces",
    active: "/workspaces/active",
    detail: (id: string) => `/workspaces/${id}`,
    restore: (id: string) => `/workspaces/${id}/restore`,
    activate: (id: string) => `/workspaces/${id}/activate`,
  },
  auditLogs: {
    list: "/audit-logs",
  },
  dashboard: {
    stats: "/dashboard",
  },
} as const;
