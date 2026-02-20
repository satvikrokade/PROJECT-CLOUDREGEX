import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DeptRegister from './pages/DeptRegister';
import DeptLogin from './pages/DeptLogin';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DeptDashboard from './pages/DeptDashboard';
import SubmitComplaint from './pages/SubmitComplaint';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-shell" data-build-tag="COMPLAINT_SYSTEM_V3">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dept-register" element={<DeptRegister />} />
                        <Route path="/dept-login" element={<DeptLogin />} />
                        <Route path="/admin-login" element={<AdminLogin />} />
                        <Route
                            path="/submit-complaint"
                            element={<SubmitComplaint />}
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin-dashboard"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dept-dashboard"
                            element={
                                <ProtectedRoute>
                                    <DeptDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
