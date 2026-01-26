import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import BottomNav from './components/BottomNav';
import TeamScreen from './components/TeamScreen';
import Home from './components/Home';
import DepositScreen from './components/DepositScreen';
import ToolScreen from './components/ToolScreen';
import AssetsScreen from './components/AssetsScreen';
import AdminPanel from './components/AdminPanel';
import WithdrawScreen from './components/WithdrawScreen';
import { db_getTeamData } from './firebase';
import { DashboardStats, TeamMember } from './types';

const AppContent: React.FC = () => {
  const { currentUser, userProfile, loading, isAdmin, systemSettings } = useAuth();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState('home');

  useEffect(() => {
    const path = location.pathname.replace('/', '') || 'home';
    setCurrentTab(path);
  }, [location]);

  const [stats, setStats] = useState<DashboardStats>({
    todayDeposit: 0,
    totalDeposit: 0,
    totalCommission: 0,
    commissionYesterday: 0,
    teamCount: 0,
    commissionToday: 0,
    todayNewTeam: 0
  });

  const [members, setMembers] = useState<TeamMember[]>([]);

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

    if (currentUser && !isAdmin) {
        fetchData();
    }
  }, [currentUser, isAdmin]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#f3f4f8]">Loading...</div>;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  if (isAdmin) {
      return <AdminPanel />;
  }

  if (systemSettings?.maintenanceMode) {
      return (
          <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
              <span className="material-icons-round text-6xl text-orange-500 mb-4">engineering</span>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Under Maintenance</h1>
              <p className="text-gray-600">We are currently upgrading our systems to serve you better. Please check back later.</p>
          </div>
      );
  }
  
  const MainLayout: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <>
      {children}
      <BottomNav currentTab={currentTab} />
    </>
  );

  return (
      <Routes>
        <Route path="/withdraw" element={<WithdrawScreen />} />
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/deposit" element={<DepositScreen />} />
              <Route path="/tool" element={<ToolScreen />} />
              <Route path="/teams" element={<TeamScreen stats={stats} members={members} />} />
              <Route path="/assets" element={<AssetsScreen />} />
              <Route path="/" element={<Navigate to="/home" />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
  );
};

const App: React.FC = () => {
    return (
      <Router>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
      </Router>
    );
};

export default App;
