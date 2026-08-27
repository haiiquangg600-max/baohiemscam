import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Traders from './pages/Traders';
import TraderDetail from './pages/TraderDetail';
import ReportForm from './pages/ReportForm';
import Reports from './pages/Reports';
import Search from './pages/Search';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminTraders from './pages/admin/AdminTraders';
import AdminReports from './pages/admin/AdminReports';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="gdv" element={<Traders />} />
        <Route path="gdv/:id" element={<TraderDetail />} />
        <Route path="bao-cao-scam" element={<ReportForm />} />
        <Route path="bao-cao" element={<Reports />} />
        <Route path="tim-kiem" element={<Search />} />
        <Route path="gioi-thieu" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="admin-login" element={<AdminLogin />} />

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="gdv" element={<AdminTraders />} />
        <Route path="bao-cao" element={<AdminReports />} />
      </Route>
    </Routes>
  );
}
