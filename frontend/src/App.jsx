import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ruangan from './pages/Ruangan/index';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import NotFound from './pages/Notfound';
import ModelManagementPage from './pages/ModelManagement';
import UnitManagementPage from './pages/UnitManagement';
import { ProjectProvider } from './contexts/ProjectContext';

function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          // src/App.jsx
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/ruangan" element={<Ruangan />} />
    <Route path="/model" element={<ModelManagementPage />} />
    <Route path="/unit" element={<UnitManagementPage />} />
    {/* Route lainnya */}
  </Route>
</Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
}

export default App;