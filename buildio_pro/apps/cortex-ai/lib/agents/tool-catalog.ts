export type ToolCatalogEntry = {
  key: string;
  name: string;
  description: string;
};

/**
 * Server-defined catalog of tools an agent can attach. Tool implementations
 * live in the chat route; this registry governs which keys are attachable to
 * agents and toolboxes. Connector-scoped tools are added here as they ship.
 */
export const toolCatalog: ToolCatalogEntry[] = [
  {
    key: "getInformation",
    name: "Knowledge retrieval",
    description: "Search the workspace knowledge base for relevant content.",
  },
  {
    key: "addResource",
    name: "Add resource",
    description: "Save provided content into the workspace knowledge base.",
  },
];

export const TOOL_CATALOG_KEYS = new Set(toolCatalog.map((entry) => entry.key));

export function isValidToolKey(key: string): boolean {
  return TOOL_CATALOG_KEYS.has(key);
}
