import React from 'react';
import { TeamMember } from '../types';

interface TeamListProps {
  members: TeamMember[];
}

const TeamList: React.FC<TeamListProps> = ({ members }) => {
  return (
    <div className="pt-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex items-center gap-2 text-primary dark:text-blue-400">
          <span className="material-icons-outlined text-lg">groups</span>
          <span className="text-sm font-semibold">Team Detail</span>
        </div>
        <button className="flex items-center gap-1 text-xs text-primary dark:text-blue-400 font-medium hover:opacity-80 transition-opacity">
          <span className="material-icons-outlined text-sm">visibility</span>
          View
        </button>
      </div>
      
      {/* Table Header */}
      <div className="bg-card-light dark:bg-card-dark rounded-t-lg py-3 px-4 flex justify-between items-center shadow-sm border-b border-slate-50 dark:border-slate-800">
        <span className="text-xs text-slate-400 dark:text-slate-500 w-1/4 text-left font-medium">Level</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 w-1/4 text-center font-medium">Count</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 w-1/4 text-center font-medium">Rate</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 w-1/4 text-right font-medium">Amount</span>
      </div>

      {/* List Items */}
      <div className="bg-card-light dark:bg-card-dark rounded-b-lg shadow-sm">
          {members.map((member, idx) => (
             <div key={member.id} className={`flex justify-between items-center py-3 px-4 ${idx !== members.length -1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
                 <div className="w-1/4 text-left flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${member.level === 1 ? 'bg-primary' : member.level === 2 ? 'bg-accent-blue' : 'bg-slate-300'}`}></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Lvl {member.level}</span>
                 </div>
                 <div className="w-1/4 text-center text-xs text-slate-600 dark:text-slate-400">
                    {member.count}
                 </div>
                 <div className="w-1/4 text-center text-xs text-slate-600 dark:text-slate-400">
                    {member.rate}
                 </div>
                 <div className="w-1/4 text-right text-xs font-semibold text-green-500">
                    ₹{member.amount.toFixed(2)}
                 </div>
             </div>
          ))}
          
          {members.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
                No team members yet.
            </div>
          )}
      </div>

      <div className="h-32"></div>
    </div>
  );
};

export default TeamList;