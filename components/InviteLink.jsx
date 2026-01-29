import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const InviteLink = () => {
  const { userProfile } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Use the Proton Drive download link
  const inviteCode = userProfile?.referralCode || '...';
  const inviteLink = 'https://drive.proton.me/urls/G083NDNDWG#Ft95saJJoTfn';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleCopyCode = () => {
    if (inviteCode === '...') return;
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
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
          onClick={handleCopyLink}
          className={`h-full flex items-center justify-center transition-colors w-14 ${copiedLink ? 'bg-green-500' : 'bg-primary hover:bg-blue-800'} text-white`}
        >
          <span className="material-icons-outlined text-lg">
            {copiedLink ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
      <div className="flex items-center mt-1 ml-1">
        <p className="text-[10px] text-slate-400">Your Referral Code: </p>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 ml-1 group"
          disabled={inviteCode === '...'}
        >
          <span className={`font-bold text-[10px] ${copiedCode ? 'text-green-600' : 'text-slate-600 group-hover:text-primary'} transition-colors`}>
            {inviteCode}
          </span>
          <span className={`material-icons-outlined text-[12px] ${copiedCode ? 'text-green-600' : 'text-slate-400 group-hover:text-primary'} transition-colors`}>
            {copiedCode ? 'check' : 'content_copy'}
          </span>
        </button>
        {copiedCode && <span className="text-[10px] text-green-600 ml-1">Copied!</span>}
      </div>
    </div>
  );
};

export default InviteLink;