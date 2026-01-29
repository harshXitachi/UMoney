import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ShareOptions = () => {
  const { userProfile } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);

  const inviteCode = userProfile?.referralCode || 'XXXXXX';
  const appDownloadLink = 'https://drive.proton.me/urls/G083NDNDWG#Ft95saJJoTfn';

  // The share message text
  const shareMessage = `Hey! I've been using UMoney and thought you might like it too.

Download the app here: ${appDownloadLink}

Use my invite code: ${inviteCode}

Using my code gets you bonus rewards when you join. 🎁`;

  const handleShare = (platform) => {
    const encodedMessage = encodeURIComponent(shareMessage);

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(appDownloadLink)}&text=${encodedMessage}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        break;
      case 'qrcode':
        setShowQRModal(true);
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: 'Join UMoney',
            text: shareMessage,
          }).catch(() => {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareMessage);
            alert('Invite message copied to clipboard!');
          });
        } else {
          navigator.clipboard.writeText(shareMessage);
          alert('Invite message copied to clipboard!');
        }
        break;
      default:
        break;
    }
  };

  const shareItems = [
    { platform: 'facebook', iconClass: 'fa-brands fa-facebook-f', label: 'Facebook', colorBg: 'bg-blue-100 dark:bg-blue-900/30', colorText: 'text-blue-600 dark:text-blue-400' },
    { platform: 'telegram', iconClass: 'fa-brands fa-telegram', label: 'Telegram', colorBg: 'bg-sky-100 dark:bg-sky-900/30', colorText: 'text-sky-500 dark:text-sky-400' },
    { platform: 'whatsapp', iconClass: 'fa-brands fa-whatsapp', label: 'WhatsApp', colorBg: 'bg-green-100 dark:bg-green-900/30', colorText: 'text-green-600 dark:text-green-400' },
    { platform: 'qrcode', iconClass: 'material-icons-outlined qr_code_scanner', label: 'QR Code', colorBg: 'bg-indigo-100 dark:bg-indigo-900/30', colorText: 'text-indigo-600 dark:text-indigo-400', isMaterial: true },
    { platform: 'share', iconClass: 'material-icons-outlined share', label: 'Share', colorBg: 'bg-red-100 dark:bg-red-900/30', colorText: 'text-red-500 dark:text-red-400', isMaterial: true },
  ];

  return (
    <>
      <div className="pt-2">
        <h3 className="text-primary dark:text-blue-400 text-sm font-semibold mb-3">More Ways To Invite</h3>
        <div className="flex justify-between items-start px-1">
          {shareItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 w-1/5 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
              onClick={() => handleShare(item.platform)}
            >
              <div className={`w-10 h-10 ${item.colorBg} rounded-full flex items-center justify-center ${item.colorText} shadow-sm`}>
                {item.isMaterial ? (
                  <span className="material-icons-outlined text-lg">{item.iconClass.replace('material-icons-outlined ', '')}</span>
                ) : (
                  <i className={`${item.iconClass} text-lg`}></i>
                )}
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Your Invite QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <span className="material-icons-round text-gray-500">close</span>
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center">
              {/* Simple QR placeholder - in production you'd use a QR library */}
              <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appDownloadLink)}`}
                  alt="QR Code"
                  className="w-44 h-44"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">Scan to download UMoney</p>
              <p className="text-xs text-gray-400 mt-1">Invite Code: <span className="font-bold text-indigo-600">{inviteCode}</span></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareOptions;