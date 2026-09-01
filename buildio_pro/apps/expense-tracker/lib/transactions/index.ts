import type { EnrichmentContext } from "./context";
import { detectRecurring } from "./recurring-detector";
import { linkRefunds } from "./refund-linker";
import { matchTransfers } from "./transfer-matcher";

export type { EnrichmentContext } from "./context";

export async function runTransactionEnrichment(ctx: EnrichmentContext) {
  const transfer = await matchTransfers(ctx);
  const refund = await linkRefunds(ctx);
  const recurring = await detectRecurring(ctx);

  return {
    ...transfer,
    ...refund,
    ...recurring,
  };
}
