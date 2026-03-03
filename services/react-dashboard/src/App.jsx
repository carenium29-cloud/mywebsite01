import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ClinicalLayout from './components/ClinicalLayout'
import AdminLayout from './components/AdminLayout'
import DashboardView from './views/DashboardView'
import PatientsView from './views/PatientsView'
import ProfileView from './views/ProfileView'
import LoginView from './views/LoginView'
import AdminDashboardView from './views/AdminDashboardView'
import AdminLoginView from './views/AdminLoginView'
import { useAuth } from './context/AuthContext'

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r?.name === 'ROLE_ADMIN') || user?.role === 'ROLE_ADMIN';
    return isAdmin ? children : <Navigate to="/admin-login" replace />;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/admin-login" element={<AdminLoginView />} />

            <Route path="/" element={<ClinicalLayout />}>
                <Route index element={<DashboardView />} />
                <Route path="patients" element={<PatientsView />} />
                <Route path="profile" element={<ProfileView />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardView view="Overview" />} />
                <Route path="staff" element={<AdminDashboardView view="Staff Management" />} />
                <Route path="patients" element={<AdminDashboardView view="Patients" />} />
                <Route path="logs" element={<AdminDashboardView view="Audit Logs" />} />
                <Route path="settings" element={<AdminDashboardView view="System Settings" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
