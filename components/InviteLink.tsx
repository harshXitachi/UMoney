import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const InviteLink: React.FC = () => {
  const { userProfile } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate link based on current user's referral code
  const inviteCode = userProfile?.referralCode || '...';
  const inviteLink = `https://umoney.app/invite/${inviteCode}`;

  const handleCopy = () => {
    if (inviteCode === '...') return;
    
    // Copy the code or the link? Usually the link.
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="pt-2">
      <h3 className="text-primary dark:text-blue-400 text-sm font-semibold mb-2">Invitation Link</h3>
      <div className="flex items-center bg-card-light dark:bg-card-dark rounded-lg overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 h-11 transition-all duration-300">
        <div className="pl-3 pr-2">
            <span className="material-icons-outlined text-slate-400 text-sm">link</span>
        </div>
        <input 
          className="w-full bg-transparent border-none text-xs text-slate-500 focus:ring-0 h-full p-0" 
          readOnly 
          type="text" 
          value={inviteLink}
        />
        <button 
          onClick={handleCopy}
          className={`h-full flex items-center justify-center transition-colors w-14 ${copied ? 'bg-green-500' : 'bg-primary hover:bg-blue-800'} text-white`}
          disabled={inviteCode === '...'}
        >
          <span className="material-icons-outlined text-lg">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-1 ml-1">Your Referral Code: <span className="font-bold text-slate-600">{inviteCode}</span></p>
    </div>
  );
};

export default InviteLink;