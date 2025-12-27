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
- [x] Alert when approaching budget limit (80%, 90%, 100%)
- [x] Identify over-budget categories
- [x] Compare budget vs actual spending month-over-month

---

## 🎪 Event Management (NEW)

### Core Features

- [x] Create events/projects (e.g., "Buying a Property", "Home Renovation", "Wedding")
- [x] View all events with status filtering (in-progress, completed, cancelled)
- [x] Edit event details (name, description, date range, status)
- [x] Delete events
- [x] View event details with linked expenses
- [x] Set estimated budget for events

### Expense Linking

- [x] Link multiple expenses to an event from different months/budgets
- [x] View total spent and remaining budget on events
- [x] Remove expenses from events
- [x] Visual budget progress for events

### Analytics

- [x] Track total spending per event
- [x] Compare actual spending vs estimated budget
- [x] View spending breakdown across linked expenses
- [x] Historical event spending reports

---

## 💰 Expense Management

### Core Features

- [x] Add new expense with category and amount
- [x] View paginated list of all expenses
- [x] Edit expense details (name, amount, category, date)
- [x] Delete expense records
- [x] View single expense with full details
- [x] Link expense to specific budget
- [x] Mark expenses as recurring (DB field: isRecurring)

### Filtering & Organization

- [x] Filter expenses by category (listExpenses with categoryId parameter)
- [x] Filter expenses by budget (listExpenses with budgetId parameter)
- [x] Sort by date or amount (sortBy, sortOrder parameters)
- [ ] Filter expenses by date range
- [ ] Search expenses by name

### Analytics

- [x] Calculate total spending for period
- [x] View monthly spending breakdown
- [x] Compare spending across months
- [x] Identify top spending categories
- [x] Track recurring expense totals

---

## 🏷️ Expense Category Management

### Core Features

- [x] Create custom expense categories
- [x] View all available categories
- [x] Edit category name and description
- [x] Delete unused categories
- [x] Prevent deletion of categories in use

### Analytics

- [x] View expense count per category
- [x] Identify most-used categories (Dashboard: topCategoriesThisMonth)
- [x] Calculate total spent per category (Dashboard: topCategoriesThisMonth)

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

- [x] Filter income by source (listIncomes with sourceId parameter)
- [x] Sort by date or amount (sortBy, sortOrder parameters)
- [ ] Filter income by date range
- [ ] Search income by name

### Analytics

- [x] Calculate total income for period
- [x] View monthly income breakdown
- [x] Compare income across months
- [x] Track income by source
- [x] Calculate net income (income - expenses)

---

## 📊 Income Source Management

### Core Features

- [x] Create custom income sources (Salary, Freelance, etc.)
- [x] View all available sources
- [x] Edit source name and description
- [x] Delete unused sources
- [x] Prevent deletion of sources in use

### Analytics

- [x] View income count per source
- [x] Identify primary income sources
- [x] Calculate total earned per source

---

## 📈 Dashboard & Reports

### Overview Dashboard

- [x] Display current month summary (income vs expenses) - overviewSummary endpoint
- [x] Show active budgets with progress bars - activeBudgetsWithProgress endpoint
- [x] Display recent transactions (last 5-10) - recentTransactions endpoint
- [x] Highlight over-budget categories - topCategoriesThisMonth endpoint
- [x] Show total balance (all-time income - expenses) - included in overviewSummary

### Financial Reports

- [ ] Monthly income vs expense report
- [ ] Yearly financial summary
- [ ] Category-wise spending report
- [ ] Budget performance report
- [ ] Net worth trend over time

### Visualizations

- [x] Pie chart for expense distribution by category
- [x] Line chart for monthly spending trends
- [x] Bar chart for income vs expenses comparison
- [x] Budget progress bars
- [x] Recurring expense timeline

---

## 🔄 Recurring Transactions

### Expense Automation

- [x] Mark expenses as recurring (DB field: isRecurring in expense table)
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

- [x] Update user profile (name, avatar, bio)
- [x] Set default currency preference
- [x] Configure timezone settings
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
- [x] Filter by recurring status (DB field exists: isRecurring)

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
