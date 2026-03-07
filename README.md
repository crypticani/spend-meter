# SpendMeter 💰

A **mobile-first**, **local-first** personal finance tracker that runs entirely in your browser. No servers, no cloud — your data stays on your device.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Multiple Accounts** — Track bank accounts, credit cards, and cash wallets
- **Transaction Tracking** — Log expenses, income, and transfers between accounts
- **Smart Categories** — Default + custom categories with emoji icons
- **Recurring Payments** — EMI and subscription tracking with installment progress
- **Dashboard** — Net worth, monthly spending, upcoming payments at a glance
- **Analytics** — Beautiful charts powered by Apache ECharts
- **Data Backup** — Export/Import your data as JSON
- **Offline Ready** — Works without internet as a Progressive Web App (PWA)
- **Installable** — Add to your home screen like a native app
- **Privacy First** — All data stored locally in IndexedDB

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Database | IndexedDB via Dexie.js |
| State | Zustand |
| Charts | Apache ECharts |
| Icons | Lucide React |
| Deployment | GitHub Pages |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spend-meter.git
cd spend-meter

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173/spend-meter/](http://localhost:5173/spend-meter/) in your browser.

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📱 PWA Installation

1. Open the app in Chrome/Safari on your phone
2. Tap "Add to Home Screen" or the install prompt
3. The app will work offline after installation

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── BottomNav    # Mobile bottom navigation
│   │   ├── Modal        # Slide-up modal
│   │   ├── EmptyState   # Empty state display
│   │   └── PageHeader   # Sticky page header
│   └── Layout           # App shell
├── db/
│   ├── database         # Dexie.js schema & types
│   ├── seed             # Default category seeds
│   └── backup           # JSON export/import
├── pages/
│   ├── Dashboard        # Main dashboard
│   ├── Transactions     # Transaction list
│   ├── AddTransaction   # Transaction form
│   ├── Analytics        # Charts & insights
│   ├── Accounts         # Account management
│   ├── AccountDetail    # Single account view
│   ├── Categories       # Category management
│   ├── RecurringPayments # EMI tracking
│   └── Settings         # Backup & preferences
├── stores/
│   ├── useAccountStore  # Account state
│   ├── useTransactionStore # Transaction state
│   ├── useCategoryStore # Category state
│   └── useRecurringStore # Recurring payment state
└── utils/
    └── format           # Currency & date formatting
```

## 🏗️ Architecture

### Key Decisions

- **Local-first with Dexie.js**: All data persists in IndexedDB. Dexie provides a clean Promise-based API with indexing support for efficient queries.
- **Zustand over Context**: Lightweight state management that avoids re-render cascades. Each store is independent and self-contained.
- **Balance sync on transactions**: Account balances are automatically updated when transactions are created or deleted, ensuring consistency.
- **Mobile-first CSS**: All layouts designed for 375px+ screens first, scaling up to desktop.
- **No build-time PWA plugin**: Hand-crafted service worker for simpler maintenance and full control over caching strategies.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

- [ ] Budget goals per category
- [ ] Multi-currency support
- [ ] Dark/Light theme toggle
- [ ] Transaction search
- [ ] Receipt photo attachment
- [ ] Data sync via file (no cloud)
- [ ] Transaction tags
- [ ] Monthly/weekly reports

---

**SpendMeter** — Take control of your finances, privately. 🔒
