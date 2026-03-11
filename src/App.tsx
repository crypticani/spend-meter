import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Analytics from './pages/Analytics';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Categories from './pages/Categories';
import RecurringPayments from './pages/RecurringPayments';
import Settings from './pages/Settings';
import { useRecurringStore } from './stores/useRecurringStore';
import { useTransactionStore } from './stores/useTransactionStore';
import { useAccountStore } from './stores/useAccountStore';
import { useCategoryStore } from './stores/useCategoryStore';
import { getNextDueDate } from './utils/format';

export default function App() {
  const { loadRecurringPayments, markInstallmentComplete } = useRecurringStore();
  const { loadTransactions, addTransaction } = useTransactionStore();
  const { loadAccounts } = useAccountStore();
  const { loadCategories } = useCategoryStore();

  useEffect(() => {
    // Process auto-payments globally on load
    const processAutoPayments = async () => {
      await loadRecurringPayments();
      await loadAccounts();
      await loadCategories();
      await loadTransactions();

      const activeAutoPays = useRecurringStore.getState().recurringPayments.filter(rp => rp.isActive && rp.autoPay);
      const transferCat = useCategoryStore.getState().categories.find((c) => c.name === 'Transfer') || useCategoryStore.getState().categories[0];

      for (const rp of activeAutoPays) {
        let nextDue = getNextDueDate(rp.startDate, rp.frequency, rp.completedInstallments);
        const now = new Date();

        while (nextDue <= now && rp.isActive) {
          // Add the transaction exactly on the due date
          await addTransaction({
            accountId: rp.accountId,
            amount: rp.amount,
            type: 'expense',
            categoryId: rp.categoryId || transferCat?.id || '',
            description: `${rp.name} - EMI ${rp.completedInstallments + 1}${rp.totalInstallments ? `/${rp.totalInstallments}` : ''} (Auto)`,
            date: nextDue,
          });

          await markInstallmentComplete(rp.id);

          // Recalculate next due date and break if it's inactive or still not in future
          const updatedRp = useRecurringStore.getState().recurringPayments.find(r => r.id === rp.id);
          if (!updatedRp || !updatedRp.isActive) break;
          nextDue = getNextDueDate(updatedRp.startDate, updatedRp.frequency, updatedRp.completedInstallments);
        }
      }

      // Reload accounts just in case balances changed
      await loadAccounts();
    };

    processAutoPayments();
  }, [loadRecurringPayments, loadAccounts, loadCategories, loadTransactions, addTransaction, markInstallmentComplete]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/edit/:id" element={<AddTransaction />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/recurring" element={<RecurringPayments />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
