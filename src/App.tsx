/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import BankList from './components/BankList';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import Login from './components/Login';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="banks" element={<BankList />} />
            <Route path="transactions" element={<TransactionForm />} />
            <Route path="history" element={<TransactionHistory />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
