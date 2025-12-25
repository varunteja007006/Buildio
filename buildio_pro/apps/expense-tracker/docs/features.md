# Expense Tracker - Feature Roadmap

## 🎯 Budget Management

### Core Features

- [x] Create monthly/yearly budgets with amount limits
- [x] View all active budgets
- [x] Edit budget amount and date range
- [x] Delete unused budgets
- [x] View budget details with linked expenses

### Analytics

- [x] Track budget progress (spent vs allocated)
- [ ] Alert when approaching budget limit (80%, 90%, 100%)
- [ ] Identify over-budget categories
- [ ] Compare budget vs actual spending month-over-month

---

## 💰 Expense Management

### Core Features

- [x] Add new expense with category and amount
- [x] View paginated list of all expenses
- [x] Edit expense details (name, amount, category, date)
- [x] Delete expense records
- [x] View single expense with full details
- [x] Link expense to specific budget

### Filtering & Organization

- [ ] Filter expenses by category
- [ ] Filter expenses by date range
- [ ] View only recurring expenses
- [ ] Search expenses by name

### Analytics

- [ ] Calculate total spending for period
- [ ] View monthly spending breakdown
- [ ] Compare spending across months
- [ ] Identify top spending categories
- [ ] Track recurring expense totals

---

## 🏷️ Expense Category Management

### Core Features

- [x] Create custom expense categories
- [x] View all available categories
- [x] Edit category name and description
- [x] Delete unused categories
- [x] Prevent deletion of categories in use

### Analytics

- [ ] View expense count per category
- [ ] Identify most-used categories
- [ ] Calculate total spent per category

---

## 💵 Income Management

### Core Features

- [x] Record new income with source and amount
- [x] View paginated list of all income
- [x] Edit income details (name, amount, source, date)
- [x] Delete income records
- [x] View single income with full details
- [x] Link income to payment method

### Filtering & Organization

- [ ] Filter income by source
- [ ] Filter income by date range
- [ ] Search income by name

### Analytics

- [ ] Calculate total income for period
- [ ] View monthly income breakdown
- [ ] Compare income across months
- [ ] Track income by source
- [ ] Calculate net income (income - expenses)

---

## 📊 Income Source Management

### Core Features

- [x] Create custom income sources (Salary, Freelance, etc.)
- [x] View all available sources
- [x] Edit source name and description
- [x] Delete unused sources
- [x] Prevent deletion of sources in use

### Analytics

- [ ] View income count per source
- [ ] Identify primary income sources
- [ ] Calculate total earned per source

---

## 📈 Dashboard & Reports

### Overview Dashboard

- [x] Display current month summary (income vs expenses)
- [x] Show active budgets with progress bars
- [x] Display recent transactions (last 5-10)
- [x] Highlight over-budget categories
- [x] Show total balance (all-time income - expenses)

### Financial Reports

- [ ] Monthly income vs expense report
- [ ] Yearly financial summary
- [ ] Category-wise spending report
- [ ] Budget performance report
- [ ] Net worth trend over time

### Visualizations

- [ ] Pie chart for expense distribution by category
- [ ] Line chart for monthly spending trends
- [ ] Bar chart for income vs expenses comparison
- [ ] Budget progress bars
- [ ] Recurring expense timeline

---

## 🔄 Recurring Transactions

### Expense Automation

- [ ] Mark expenses as recurring
- [ ] Set recurrence frequency (weekly, monthly, yearly)
- [ ] Auto-create recurring expenses
- [ ] View all recurring expenses
- [ ] Pause/resume recurring expenses

### Income Automation

- [ ] Mark income as recurring
- [ ] Set recurrence frequency
- [ ] Auto-create recurring income
- [ ] View all recurring income

---

## ⚙️ User Settings & Preferences

### Profile Management

- [ ] Update user profile (name, avatar, bio)
- [ ] Set default currency preference
- [ ] Configure timezone settings
- [ ] Set budget notification thresholds
- [ ] Manage account limits

### Data Management

- [ ] Export transactions to CSV/Excel
- [ ] Import transactions from CSV
- [ ] Backup all financial data
- [ ] Archive old transactions
- [ ] Soft delete with recovery option

---

## 🔍 Search & Filters

### Advanced Search

- [ ] Full-text search across all transactions
- [ ] Filter by multiple categories simultaneously
- [ ] Custom date range selection
- [ ] Filter by amount range (min-max)
- [ ] Filter by recurring status

### Saved Filters

- [ ] Save frequently used filter combinations
- [ ] Quick access to saved searches
- [ ] Share filter presets

---

## 🔔 Notifications & Alerts

### Budget Alerts

- [ ] Notify when budget reaches 80% threshold
- [ ] Alert when budget is exceeded
- [ ] Weekly budget summary email
- [ ] Monthly spending report notification

### Transaction Reminders

- [ ] Remind to log daily expenses
- [ ] Alert for missing recurring transactions
- [ ] Notify on large transactions (configurable amount)

---

## 📱 Mobile & Responsive

### UI/UX

- [ ] Responsive design for mobile/tablet
- [ ] Quick add expense button
- [ ] Swipe to delete transactions
- [ ] Pull to refresh transaction list
- [ ] Offline mode support

---

## 🔐 Security & Privacy

### Authentication

- [ ] Email/password login
- [ ] OAuth social login
- [ ] Two-factor authentication
- [ ] Password reset flow
- [ ] Email verification

### Data Security

- [ ] Encrypt sensitive financial data
- [ ] Activity log for account changes
- [ ] Session management
- [ ] Secure API endpoints

---

## 🎨 Customization

### Themes & Display

- [ ] Support for multiple themes
- [ ] Custom category colors
- [ ] Currency formatting options
- [ ] Date format preferences
- [ ] Language localization

---

## Priority Labels

**Phase 1 (MVP):** Budget, Expense, Income core CRUD + Basic dashboard  
**Phase 2:** Categories, Sources, Filtering, Basic analytics  
**Phase 3:** Advanced analytics, Reports, Visualizations  
**Phase 4:** Recurring transactions, Notifications, Automation  
**Phase 5:** Advanced features, Import/Export, Mobile optimization

---

## Progress Tracking

**Total Features:** 100+  
**Completed:** 39 (Budget + Expense + Category + Income + Source Management + Overview Dashboard - Full CRUD with UI Components)  
**In Progress:** 0  
**Not Started:** 61+

### Recently Completed

- ✅ Budget Management - All Core Features (Create, View, Edit, Delete, Details)
- ✅ Budget Progress Tracking (Spent vs Allocated with visual indicators)
- ✅ TRPC API Routes for Budget Management
- ✅ Complete Budget UI with Pagination, Filtering, and Responsive Design
- ✅ Expense Management - All Core Features (Create, View, Edit, Delete, Details)
- ✅ Expense-Budget Linking
- ✅ TRPC API Routes for Expense Management
- ✅ Complete Expense UI with Pagination, Sorting, and Filtering
- ✅ Expense Category Management - All Core Features (Create, View, Edit, Delete)
- ✅ ExpenseCategoryFormComponent - Full form with useAppForm pattern
- ✅ ExpenseCategoryDetailsComponent - View/Edit/Delete with mutations
- ✅ Category Validation (Prevent deletion of categories in use)
- ✅ TRPC API Routes for Expense Category Management
- ✅ Dynamic Category Fetching in Expense Form
- ✅ Income Management - All Core Features (Create, View, Edit, Delete, Details)
- ✅ IncomeFormComponent - Full form with source selection and useAppForm pattern
- ✅ IncomeDetailsComponent - View/Edit/Delete with mutations
- ✅ Income-Payment Method Linking
- ✅ TRPC API Routes for Income Management
- ✅ Income Source Management - All Core Features (Create, View, Edit, Delete)
- ✅ IncomeSourceFormComponent - Full form with useAppForm pattern
- ✅ IncomeSourceDetailsComponent - View/Edit/Delete with mutations
- ✅ Source Validation (Prevent deletion of sources in use)
- ✅ TRPC API Routes for Income Source Management
- ✅ Next.js 15+ Params Type Compatibility (Promise-based params handling)
- ✅ All 6 Form & Details Components Fully Functional with Server-Side Data Fetching
- ✅ Dashboard - Overview Dashboard (Monthly Summary, Active Budgets, Recent Transactions, Top Categories)
- ✅ Dashboard TRPC Router with 4 endpoints (overviewSummary, activeBudgetsWithProgress, recentTransactions, topCategoriesThisMonth)
- ✅ Dashboard UI with Summary Cards, Budget Progress Bars, Over-Budget Badges, and Quick Links

_Last Updated: December 25, 2025_
