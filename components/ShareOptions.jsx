import React from 'react';

const ShareOptions = () => {
  const shareItems = [
    { iconClass: 'fa-brands fa-facebook-f', label: 'Facebook', colorBg: 'bg-blue-100 dark:bg-blue-900/30', colorText: 'text-blue-600 dark:text-blue-400' },
    { iconClass: 'fa-brands fa-telegram', label: 'Telegram', colorBg: 'bg-sky-100 dark:bg-sky-900/30', colorText: 'text-sky-500 dark:text-sky-400' },
    { iconClass: 'fa-brands fa-whatsapp', label: 'WhatsApp', colorBg: 'bg-green-100 dark:bg-green-900/30', colorText: 'text-green-600 dark:text-green-400' },
    { iconClass: 'material-icons-outlined qr_code_scanner', label: 'QR Code', colorBg: 'bg-indigo-100 dark:bg-indigo-900/30', colorText: 'text-indigo-600 dark:text-indigo-400', isMaterial: true },
    { iconClass: 'material-icons-outlined share', label: 'Share', colorBg: 'bg-red-100 dark:bg-red-900/30', colorText: 'text-red-500 dark:text-red-400', isMaterial: true },
  ];

  return (
    <div className="pt-2">
      <h3 className="text-primary dark:text-blue-400 text-sm font-semibold mb-3">More Ways To Invite</h3>
      <div className="flex justify-between items-start px-1">
        {shareItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2 w-1/5 cursor-pointer hover:opacity-80 transition-opacity">
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
  );
};

export default ShareOptions;