import React from 'react';
import { DashboardStats } from '../types';

interface CommissionCardProps {
  stats: DashboardStats;
}

const CommissionCard: React.FC<CommissionCardProps> = ({ stats }) => {
  return (
    <div className="rounded-2xl p-5 shadow-lg bg-gradient-to-b from-primary to-secondary text-white relative overflow-hidden">
      {/* Background Decorative Circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex items-center space-x-2 mb-2 opacity-90">
        <span className="material-icons-outlined text-lg">monetization_on</span> 
        <span className="text-sm font-medium">My Total Commission</span>
      </div>
      
      <div className="text-3xl font-bold mb-6">₹ {stats.totalCommission.toFixed(1)}</div>
      
      <div className="space-y-2 text-xs opacity-90">
        <div className="flex justify-between items-center">
          <span className="font-light">Commission Yesterday</span>
          <span className="font-medium">{stats.commissionYesterday.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-light">Team Count</span>
          <span className="font-medium">{stats.teamCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-light">Commission Today</span>
          <span className="font-medium text-green-300">+{stats.commissionToday.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-light">Today New Team</span>
          <span className="font-medium text-green-300">+{stats.todayNewTeam}</span>
        </div>
      </div>
    </div>
  );
};

export default CommissionCard;