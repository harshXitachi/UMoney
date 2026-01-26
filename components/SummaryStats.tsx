import React from 'react';

interface SummaryStatsProps {
  todayDeposit: number;
  totalDeposit: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ todayDeposit, totalDeposit }) => {
  const formatCurrency = (amount: number) => `₹ ${amount.toFixed(2)}`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm flex flex-col justify-between h-24">
        <div className="flex items-center space-x-2 mb-1">
          <span className="material-icons-outlined text-blue-500 text-lg">calendar_today</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today</span>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">Team Deposit</div>
          <div className="text-blue-500 font-bold text-lg">{formatCurrency(todayDeposit)}</div>
        </div>
      </div>
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm flex flex-col justify-between h-24">
        <div className="flex items-center space-x-2 mb-1">
          <span className="material-icons-outlined text-green-500 text-lg">account_balance_wallet</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</span>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">Team Deposit</div>
          <div className="text-green-500 font-bold text-lg">{formatCurrency(totalDeposit)}</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;