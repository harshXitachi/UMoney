import React from 'react';
import Header from './Header';
import SummaryStats from './SummaryStats';
import CommissionCard from './CommissionCard';
import InviteLink from './InviteLink';
import ShareOptions from './ShareOptions';
import TeamList from './TeamList';
import { DashboardStats, TeamMember } from '../types';

interface TeamScreenProps {
  stats: DashboardStats;
  members: TeamMember[];
}

const TeamScreen: React.FC<TeamScreenProps> = ({ stats, members }) => {
  return (
    <>
      <Header />
      <main className="px-4 -mt-8 relative z-20 space-y-4 pb-12">
        <SummaryStats 
          todayDeposit={stats.todayDeposit} 
          totalDeposit={stats.totalDeposit} 
        />
        <CommissionCard stats={stats} />
        <InviteLink />
        <ShareOptions />
        <TeamList members={members} />
      </main>
    </>
  );
};

export default TeamScreen;
