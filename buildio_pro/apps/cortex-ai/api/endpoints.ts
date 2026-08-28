export const endpoints = {
  chat: {
    stream: "/chat",
    threads: "/chat/threads",
    thread: (id: string) => `/chat/threads/${id}`,
  },
  workspaces: {
    list: "/workspaces",
    active: "/workspaces/active",
    detail: (id: string) => `/workspaces/${id}`,
    restore: (id: string) => `/workspaces/${id}/restore`,
    activate: (id: string) => `/workspaces/${id}/activate`,
  },
} as const;