import React from 'react';
import Header from './Header.jsx';
import SummaryStats from './SummaryStats.jsx';
import CommissionCard from './CommissionCard.jsx';
import InviteLink from './InviteLink.jsx';
import ShareOptions from './ShareOptions.jsx';
import TeamList from './TeamList.jsx';

const TeamScreen = ({ stats, members }) => {
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