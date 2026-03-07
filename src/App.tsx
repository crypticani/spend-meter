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

export default function App() {
  return (
    <BrowserRouter basename="/spend-meter">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/add" element={<AddTransaction />} />
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
