// src/App.jsx  (place this in your FRONTEND project)
import { Toaster }            from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound  from './lib/PageNotFound';
import { pagesConfig } from './pages.config';
import Home         from './pages/Home';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TaxReport    from './pages/TaxReport';
import Wallets      from './pages/Wallets';
import Exchanges    from './pages/Exchanges';
import Upgrade      from './pages/Upgrade';

const { Layout } = pagesConfig;

const Wrap = ({ children, name }) =>
  Layout ? <Layout currentPageName={name}>{children}</Layout> : <>{children}</>;

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/Home"        element={<Home />} />
          <Route path="/Dashboard"   element={<Wrap name="Dashboard"><Dashboard /></Wrap>} />
          <Route path="/Transactions" element={<Wrap name="Transactions"><Transactions /></Wrap>} />
          <Route path="/TaxReport"   element={<Wrap name="TaxReport"><TaxReport /></Wrap>} />
          <Route path="/Wallets"     element={<Wrap name="Wallets"><Wallets /></Wrap>} />
          <Route path="/Exchanges"   element={<Wrap name="Exchanges"><Exchanges /></Wrap>} />
          <Route path="/Upgrade"     element={<Wrap name="Upgrade"><Upgrade /></Wrap>} />
          <Route path="*"            element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
