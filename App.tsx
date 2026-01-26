import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import BottomNav from './components/BottomNav';
import TeamScreen from './components/TeamScreen';
import Home from './components/Home';
import DepositScreen from './components/DepositScreen';
import ToolScreen from './components/ToolScreen';
import AssetsScreen from './components/AssetsScreen';
import AdminPanel from './components/AdminPanel';
import { db_getTeamData } from './firebase';
import { DashboardStats, TeamMember } from './types';

const AppContent: React.FC = () => {
  const { currentUser, userProfile, loading, isAdmin, systemSettings } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  
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
    // Fetch Team Data when tab changes to teams or user loads
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
        fetchData(); // Fetch on mount
    }
  }, [currentUser, currentTab, isAdmin]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#f3f4f8]">Loading...</div>;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  // Admin Route
  if (isAdmin) {
      return <AdminPanel />;
  }

  // Maintenance Mode Check (Admin bypasses it)
  if (systemSettings?.maintenanceMode) {
      return (
          <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
              <span className="material-icons-round text-6xl text-orange-500 mb-4">engineering</span>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Under Maintenance</h1>
              <p className="text-gray-600">We are currently upgrading our systems to serve you better. Please check back later.</p>
          </div>
      );
  }

  const renderContent = () => {
    switch(currentTab) {
      case 'home':
        return <Home />;
      case 'deposit':
        return <DepositScreen />;
      case 'tool':
        return <ToolScreen />;
      case 'teams':
        return <TeamScreen stats={stats} members={members} />;
      case 'assets':
        return <AssetsScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;