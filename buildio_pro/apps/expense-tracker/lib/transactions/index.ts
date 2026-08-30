import type { EnrichmentContext } from "./context";

import { linkRefunds } from "./refund-linker";
import { detectRecurring } from "./recurring-detector";
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
