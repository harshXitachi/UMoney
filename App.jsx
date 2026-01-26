import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import BottomNav from './components/BottomNav.jsx';
import TeamScreen from './components/TeamScreen.jsx';
import Home from './components/Home.jsx';
import DepositScreen from './components/DepositScreen.jsx';
import ToolScreen from './components/ToolScreen.jsx';
import AssetsScreen from './components/AssetsScreen.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import WithdrawScreen from './components/WithdrawScreen.jsx';
import { db_getTeamData } from './firebase.js';

const MainLayout = () => {
  const location = useLocation();
  const currentTab = location.pathname.split('/')[1] || 'home';
  return (
    <>
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav currentTab={currentTab} />
    </>
  );
};

const AppContent = () => {
  const { currentUser, loading, isAdmin, systemSettings } = useAuth();
  const [stats, setStats] = useState({ todayDeposit: 0, totalDeposit: 0, totalCommission: 0, commissionYesterday: 0, teamCount: 0, commissionToday: 0, todayNewTeam: 0 });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || isAdmin) return;
      try {
        const data = await db_getTeamData(currentUser.uid);
        setStats(data.stats);
        setMembers(data.members);
      } catch (e) {
        console.error("Error fetching team data", e);
      }
    };
    if (currentUser && !isAdmin) fetchData();
  }, [currentUser, isAdmin]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#f3f4f8]">Loading...</div>;
  }

  if (systemSettings?.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <span className="material-icons-round text-6xl text-orange-500 mb-4">engineering</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Under Maintenance</h1>
        <p className="text-gray-600">We are currently upgrading our systems. Please check back later.</p>
      </div>
    );
  }

  return (
    <Routes>
      {!currentUser ? (
        <>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : isAdmin ? (
        <Route path="*" element={<AdminPanel />} />
      ) : (
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="deposit" element={<DepositScreen />} />
          <Route path="tool" element={<ToolScreen />} />
          <Route path="teams" element={<TeamScreen stats={stats} members={members} />} />
          <Route path="assets" element={<AssetsScreen />} />
          <Route path="withdraw" element={<WithdrawScreen />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Route>
      )}
    </Routes>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
