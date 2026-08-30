import { generateObject, zodSchema } from "ai";
import "server-only";

import { gateway } from "./gateway";
import {
  statementExtractionSchema,
  type StatementExtraction,
} from "./schema";

export type ExtractStatementInput = {
  buffer: Buffer;
  contentType: string;
  filename: string;
  documentType: string;
  modelId: string;
};

const SYSTEM_PROMPT = `You are a bank statement extraction engine. You parse bank and credit card statements (UPI, NEFT, IMPS, RTGS, NACH, ACH, POS, ATM, cash, etc.) into a normalized, structured list of transactions.

# Extraction rules

- Extract EVERY transaction line. Never skip, merge or summarise rows. If a table continues on the next page, keep extracting.
- date: transaction date in YYYY-MM-DD (local date shown on the statement).
- amount: always a positive number in the statement currency. The direction field disambiguates credit (money in) from debit (money out). Ignore formatting like commas, "Rs.", "₹", "-" signs.
- direction: "credit" for money in, "debit" for money out.
- transactionType: classify carefully — NOT every debit is an expense. Use exactly one of:
  expense | income | transfer | investment | loan_payment | insurance | refund | interest | fee | cash_withdrawal | round_up | unknown
  - Salary/credit from an employer => income
  - NACH/ACH debit to a housing finance company (e.g. LIC Housing Finance) => loan_payment
  - Contributions to Groww, mutual funds, stocks, SIP, RD/FD transfers => investment
  - NACH/ACH debit to an insurer (e.g. Max Life Insurance) => insurance
  - Narration starting "Round ups" / "Round-up" => round_up
  - Narration with "Refund", "RFD", "Reversal", "Cashback" (credit side) => refund
  - Movement between the statement holder's OWN accounts => transfer
  - Interest credited => interest; bank charges => fee; ATM withdrawal => cash_withdrawal
  - When genuinely unclear => unknown
- merchant: a short, clean payee name, e.g. "Swiggy", "Indian Railways", "Groww", "Zepto", "Max Life Insurance", "LIC Housing Finance". Extract it from the narration. Leave empty for personal transfers.
- counterparty: the name of the other party when visible, e.g. "Mr S Balaji", "KOPPISETTI VARUN TEJA".
- category / subcategory: derive from the merchant/narration using this hierarchy (set category, and subcategory when it fits):
  Food (Restaurants, Food Delivery, Groceries, Snacks), Transport (Train, Flight, Cab, Fuel, Parking), Housing (Rent, Home Loan, Electricity, Maintenance), Financial (Investment, Insurance, Loan Payment, Bank Fee, Interest), Shopping (Electronics, Clothing, General), Entertainment (Movies, Games, Subscriptions), Income (Salary, Freelance, Refund, Interest), Transfers (Own Account Transfer).
  Examples: Swiggy => Food/Food Delivery; Indian Railways => Transport/Train; Groww => Financial/Investment; salary credit => Income/Salary; home loan => Housing/Home Loan.
- paymentMethod: UPI | NEFT | IMPS | RTGS | NACH | ACH | CARD | ATM | CASH | OTHER, from the narration prefix (e.g. "UPI-..." => UPI).
- referenceNumber: transaction/reference id (UTR, RRN, transaction number) if shown; otherwise omit.
- balanceAfter: the running balance printed next to the row, if shown; otherwise omit.
- isTransfer: true only for movement between the holder's own accounts. Set isTransfer=false for all normal expenses and income.
- isRecurring: true for clearly periodic entries (SALARY, EMI, NACH/ACH debits, insurance premiums, subscriptions); false otherwise.
- rawDescription: the FULL original narration exactly as printed, unmodified and untruncated. This is our escape hatch for re-processing.
- extractionConfidence: a number 0..1 reflecting how confident you are (clean machine-printed rows = 1.0, fuzzy handwriting/scans = lower).

# Statement metadata

- bank: bank/provider name (e.g. "Axis Bank", "Kotak Mahindra Bank", "Slice").
- accountType: account type if visible (e.g. Savings, Current, Credit Card).
- accountNumberMasked: the masked account/card identifier only (e.g. "****2247"). NEVER return a full account or card number.
- statementStart / statementEnd: the period the statement covers (YYYY-MM-DD).
- openingBalance / closingBalance: opening and closing balances if shown.
- currency: currency code of the statement (e.g. "INR").

# CRITICAL PRIVACY

Never output full account numbers, full card numbers, IFSC/MICR codes, PAN, Aadhaar, phone numbers, email addresses, or postal addresses anywhere in the response. Only masked identifiers are allowed.`;

const USER_PROMPT = `Extract every transaction and the statement metadata from the attached file. Follow the system instructions exactly and return the complete structured result.`;

/**
 * Sends a bank statement file to the Vercel AI Gateway and returns the
 * normalized transactions plus statement-level metadata.
 */
export async function extractStatement({
  buffer,
  contentType,
  filename,
  documentType,
  modelId,
}: ExtractStatementInput): Promise<StatementExtraction> {
  const result = await generateObject({
    model: gateway.languageModel(modelId),
    schemaName: "statement_extraction",
    schemaDescription:
      "Normalized transactions and account metadata extracted from a bank/credit card statement.",
    schema: zodSchema(statementExtractionSchema),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: buffer,
            mediaType: contentType,
            filename,
          },
          {
            type: "text",
            text: `${USER_PROMPT}\n\nDocument type: ${documentType}.`,
          },
        ],
      },
    ],
  });

  return result.object;
}
