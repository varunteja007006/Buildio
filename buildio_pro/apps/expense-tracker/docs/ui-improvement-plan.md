# UI Improvement Plan: Expense Tracker

## 1. Design Philosophy: "Modern Financial Clarity"

The goal is to transform the current functional UI into a polished, professional, and visually engaging experience. We will focus on:
- **Visual Hierarchy:** Using typography, spacing, and color to guide the user's eye.
- **Data Visualization:** Making numbers easy to digest through charts and progress indicators.
- **Micro-interactions:** Adding subtle animations to make the app feel alive.
- **Consistency:** Ensuring a unified look across all pages using the `citrus` theme.

## 2. Global Enhancements

### Typography & Spacing
- **Font:** Ensure `Inter` or a similar clean sans-serif is used (already likely via `font-sans`).
- **Headings:** Increase contrast and weight for page titles. Add subtle gradients to main dashboard headings.
- **Spacing:** Increase whitespace between sections (`gap-6` -> `gap-8`) to reduce clutter.

### Theme & Colors (`citrus` theme)
- Leverage the `citrus` theme's primary colors for call-to-action buttons and key metrics.
- Use subtle background patterns or gradients in the `SidebarInset` to break up large white spaces.

## 3. Component-Specific Upgrades

### A. Dashboard (`/dashboard`)
*Current:* Grid of 4 cards, simple lists.
*Upgrade:*
1.  **Summary Cards:**
    - Add trend indicators (e.g., "+5% from last month" in green/red).
    - Add subtle background icons (opacity 10%) behind the numbers.
2.  **Charts (New):**
    - Replace simple lists with Recharts (or similar) for "Income vs Expense" trends.
    - Use a Donut chart for "Top Categories".
3.  **Recent Transactions:**
    - Style as a clean table with avatars/icons for categories.
    - Use color coding for amounts (+Green, -Red).

### B. Navigation (Sidebar)
*Current:* Standard Shadcn Sidebar.
*Upgrade:*
- **User Profile:** Enhance the user dropdown with a better avatar and "Pro" badge if applicable.
- **Active State:** Add a distinct glow or border to the active menu item.

### C. Lists (Expenses, Income, Events)
*Current:* Basic tables or lists.
*Upgrade:*
- **Card View:** For mobile, switch tables to card views.
- **Filters:** Move filters to a "Filter Bar" with distinct pill-shaped buttons.
- **Empty States:** Create custom illustrations or icons for empty states (e.g., "No expenses yet? Go buy a coffee!").

### D. Forms (Add/Edit)
*Current:* Standard dialogs.
*Upgrade:*
- **Multi-step:** For complex forms (like Events), consider a wizard approach.
- **Input Groups:** Add icons inside input fields (e.g., Dollar sign for amount).

## 4. Implementation Steps

1.  **Dashboard Revamp:**
    - Update `DashboardPage` to use a more grid-heavy layout (Bento box style).
    - Enhance `SummaryCards` with visual flair.
    - *Action:* Edit `apps/expense-tracker/app/(protected)/dashboard/page.tsx`.

2.  **Transaction Lists:**
    - Create a reusable `TransactionTable` component with sorting/filtering built-in.
    - Add "Category Icons" helper to map category names to Lucide icons.
    - *Action:* Update `apps/expense-tracker/app/(protected)/expenses/page.tsx` (and Income).

3.  **Event Cards:**
    - Turn the Event list into a grid of "Project Cards" with progress bars and "Days Left" countdowns.
    - *Action:* Update `apps/expense-tracker/app/(protected)/events/page.tsx`.

4.  **Global Polish:**
    - Add `framer-motion` for page transitions (optional but recommended).
    - Refine the `Sidebar` styling in `apps/expense-tracker/components/organisms/sidebar/app-sidebar.tsx`.

## 5. Review & Feedback
- User to review this plan.
- Once approved, we start with Step 1 (Dashboard).
