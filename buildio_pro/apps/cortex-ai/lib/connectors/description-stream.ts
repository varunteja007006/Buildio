export type SampleSummary = {
  schema: string;
  table: string;
  columns: string[];
  rowCount: number;
};

export function streamEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: Record<string, unknown>,
) {
  controller.enqueue(new TextEncoder().encode(`${JSON.stringify(event)}\n`));
}

export function failureMessage(error: unknown, aborted: boolean) {
  if (aborted) return "Generation cancelled";
  if (
    error instanceof Error &&
    /not found|limit|select|sampled|sensitive|schema|columns|tables|consent/i.test(
      error.message,
    )
  )
    return error.message;
  return "Unable to generate description. Check connector and AI service, then try again.";
}
