import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth_signOut, db_getTransactions, auth_updateUserPassword } from '../firebase';
import { Transaction } from '../types';

type ViewType = 'MAIN' | 'QUOTA_HISTORY' | 'DEPOSIT_HISTORY' | 'WITHDRAW_HISTORY' | 'SUPPORT' | 'CHANGE_PASSWORD' | 'VERSION';

const AssetsScreen: React.FC = () => {
  const { userProfile } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('MAIN');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // State for Lists
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // State for Change Password
  const [passForm, setPassForm] = useState({ new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // --- Fetch Logic for Histories ---
  const fetchHistory = async (type: string) => {
    if (!userProfile) return;
    setListLoading(true);
    try {
        const data = await db_getTransactions(userProfile.uid, type);
        setTransactions(data);
    } catch (e) {
        console.error(e);
    }
    setListLoading(false);
  };

  const handleNavigate = (view: ViewType) => {
      setCurrentView(view);
      // Pre-fetch data if needed
      if (view === 'QUOTA_HISTORY') fetchHistory('DEPOSIT_INR');
      if (view === 'DEPOSIT_HISTORY') fetchHistory('DEPOSIT_USDT');
      if (view === 'WITHDRAW_HISTORY') fetchHistory('WITHDRAW');
  };

  // --- Render Components ---

  const renderHeader = (title: string) => (
      <div className="flex items-center mb-6 px-4 pt-12">
         <button onClick={() => setCurrentView('MAIN')} className="mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors">
             <span className="material-icons-round text-gray-700">arrow_back</span>
         </button>
         <h1 className="text-xl font-bold text-gray-800">{title}</h1>
     </div>
  );

  const renderTransactionList = (items: Transaction[], emptyMsg: string) => (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-4">
          {listLoading ? (
              <div className="p-8 flex justify-center">
                  <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              </div>
          ) : items.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center text-gray-400">
                  <span className="material-icons-outlined text-4xl mb-2 opacity-30">history</span>
                  <p className="text-sm">{emptyMsg}</p>
              </div>
          ) : (
              <div className="divide-y divide-gray-50">
                  {items.map(tx => (
                      <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                              <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'WITHDRAW' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                  <span className="material-icons-round text-sm">
                                      {tx.type === 'WITHDRAW' ? 'arrow_upward' : 'arrow_downward'}
                                  </span>
                              </div>
                              <div>
                                  <div className="font-semibold text-sm text-gray-800">
                                      {tx.description || (tx.type === 'DEPOSIT_INR' ? 'Quota Purchase' : tx.type === 'DEPOSIT_USDT' ? 'USDT Deposit' : 'Withdrawal')}
                                  </div>
                                  <div className="text-[10px] text-gray-400 mt-0.5">
                                      {tx.date && tx.date.seconds 
                                         ? new Date(tx.date.seconds * 1000).toLocaleString() 
                                         : 'Just now'}
                                  </div>
                                  {tx.utr && <div className="text-[10px] text-gray-500 mt-0.5 font-mono">Ref: {tx.utr}</div>}
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`font-bold text-sm ${tx.type === 'WITHDRAW' ? 'text-red-600' : 'text-green-600'}`}>
                                  {tx.type === 'WITHDRAW' ? '-' : '+'}{tx.amountInr ? `₹${tx.amountInr}` : `${tx.amount} ${tx.type.includes('USDT') ? 'USDT' : 'INR'}`}
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wide
                                  ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                    tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                    'bg-orange-100 text-orange-700'}`}>
                                  {tx.status}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderChangePassword = () => {
      const handleSubmit = async () => {
          if (passForm.new.length < 6) { setPassMsg('Password must be at least 6 characters'); return; }
          if (passForm.new !== passForm.confirm) { setPassMsg('Passwords do not match'); return; }
          setPassLoading(true);
          try {
              await auth_updateUserPassword(passForm.new);
              setPassMsg('Password updated successfully!');
              setPassForm({ new: '', confirm: '' });
          } catch(e:any) {
              setPassMsg(e.message || 'Error updating password. Please re-login and try again.');
          }
          setPassLoading(false);
      };

      return (
          <div className="px-4">
              <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                  <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">New Password</label>
                      <input 
                          type="password" 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={passForm.new}
                          onChange={e => setPassForm({...passForm, new: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Confirm Password</label>
                      <input 
                          type="password" 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={passForm.confirm}
                          onChange={e => setPassForm({...passForm, confirm: e.target.value})}
                      />
                  </div>
                  {passMsg && (
                      <div className={`text-xs text-center p-2 rounded ${passMsg.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {passMsg}
                      </div>
                  )}
                  <button 
                      onClick={handleSubmit}
                      disabled={passLoading}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                  >
                      {passLoading ? 'Updating...' : 'Update Password'}
                  </button>
              </div>
          </div>
      );
  };

  // --- Sub-View Switcher ---
  if (currentView !== 'MAIN') {
      return (
          <div className="bg-[#f3f4f6] min-h-screen pb-24 font-sans">
              {currentView === 'QUOTA_HISTORY' && (
                  <> {renderHeader('Quota History')} {renderTransactionList(transactions, 'No quota purchases found.')} </>
              )}
              {currentView === 'DEPOSIT_HISTORY' && (
                  <> {renderHeader('Deposit History')} {renderTransactionList(transactions, 'No USDT deposits found.')} </>
              )}
              {currentView === 'WITHDRAW_HISTORY' && (
                  <> {renderHeader('Withdrawal History')} {renderTransactionList(transactions, 'No withdrawals found.')} </>
              )}
              {currentView === 'SUPPORT' && (
                  <> 
                      {renderHeader('Support Center')} 
                      <div className="px-4">
                          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                              <img src="https://cdn-icons-png.flaticon.com/512/4961/4961759.png" alt="Support" className="w-24 h-24 mx-auto mb-4 opacity-80" />
                              <h3 className="text-lg font-bold text-gray-800 mb-2">How can we help?</h3>
                              <p className="text-sm text-gray-500 mb-6">Our team is available 24/7 to assist you with any issues.</p>
                              <button className="w-full bg-green-500 text-white font-bold py-3 rounded-lg shadow hover:bg-green-600 flex items-center justify-center gap-2 mb-3">
                                  <i className="fab fa-whatsapp text-xl"></i> Chat on WhatsApp
                              </button>
                              <button className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-600 flex items-center justify-center gap-2">
                                  <i className="fab fa-telegram text-xl"></i> Chat on Telegram
                              </button>
                          </div>
                      </div>
                  </>
              )}
              {currentView === 'CHANGE_PASSWORD' && (
                  <> {renderHeader('Change Password')} {renderChangePassword()} </>
              )}
              {currentView === 'VERSION' && (
                  <> 
                      {renderHeader('Version Update')} 
                      <div className="px-4 text-center mt-12">
                          <div className="w-24 h-24 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-6">
                              <span className="material-icons-round text-5xl text-blue-600">system_update</span>
                          </div>
                          <h2 className="text-xl font-bold text-gray-800 mb-1">UMoney App</h2>
                          <p className="text-sm text-gray-500 mb-8">Current Version 1.0.0 (Beta)</p>
                          
                          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium mb-8 mx-auto max-w-xs">
                              You are using the latest version.
                          </div>
                          
                          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50">
                              Check for Updates
                          </button>
                      </div>
                  </>
              )}
          </div>
      );
  }

  // --- Main Assets View ---
  const menuItems = [
    { icon: 'description', label: 'Quota History', bg: 'bg-purple-50', text: 'text-purple-600', action: () => handleNavigate('QUOTA_HISTORY') },
    { icon: 'move_to_inbox', label: 'Deposit History', bg: 'bg-green-50', text: 'text-green-600', action: () => handleNavigate('DEPOSIT_HISTORY') },
    { icon: 'upload', label: 'Withdrawal History', bg: 'bg-red-50', text: 'text-red-600', action: () => handleNavigate('WITHDRAW_HISTORY') },
    { icon: 'help_outline', label: 'Support Center', bg: 'bg-orange-50', text: 'text-orange-600', action: () => handleNavigate('SUPPORT') },
    // Removed Payment Pin as requested
    { icon: 'lock', label: 'Change Password', bg: 'bg-blue-50', text: 'text-blue-600', action: () => handleNavigate('CHANGE_PASSWORD') },
    { icon: 'system_update', label: 'Version Update', bg: 'bg-sky-50', text: 'text-sky-600', action: () => handleNavigate('VERSION') },
    { icon: 'logout', label: 'Logout', bg: 'bg-rose-50', text: 'text-rose-600', action: () => setShowLogoutModal(true) },
  ];

  return (
    <div className="bg-[#f3f4f6] min-h-screen pb-24 font-sans">
      {/* Header Section */}
      <div className="bg-assets-primary pt-12 pb-6 px-5 rounded-b-[2rem] shadow-lg relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-white text-lg font-medium tracking-wide">Assets</h1>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-yellow-100 border-2 border-yellow-300 overflow-hidden flex items-center justify-center">
                <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGYEaYgs7vLQ6u5zH4n8cX8fcDukR-VLVoTKr3Xav3OQtz5VyrIDTXfEK-MsG3uH7w3h1LX9DfED9pufWvMx5FL4tiZXnkww0YCfccgG__iAZWZakbUkKiV4ZPjVdYDYsSMo5Sp-0vEk6pLcdweXg1rZKHuslNWRJI1Gg8YdYly2zFMWYbX9f6DTzXCYJnFqz0bdvwpL7VXBkR_-IWeFnx4K4YC0zKVUg_82rfo-OkYRtdOWMvISjWeGPjIeea2pt1Ky0CzN7wbl2R"/>
              </div>
            </div>
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg font-semibold tracking-wide">
                    {userProfile?.phone || userProfile?.email?.split('@')[0] || 'User'}
                </span>
                <button className="opacity-80 hover:opacity-100 transition-opacity">
                  <span className="material-icons-round text-sm">content_copy</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <span>ID: {userProfile?.referralCode}</span>
                <button className="opacity-80 hover:opacity-100 transition-opacity">
                  <span className="material-icons-round text-xs">content_copy</span>
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white px-3 py-1 rounded-full shadow-sm">
            <span className="text-assets-primary text-xs font-bold">Reward Ratio: 3</span>
          </div>
        </div>
      </div>

      {/* Stats and Links Section */}
      <div className="px-4 -mt-4 relative z-20 space-y-4">
        {/* Stats Card */}
        <div className="bg-assets-primary text-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-medium">₹</span>
              <span className="text-2xl font-bold">{userProfile?.inrBalance.toFixed(2) || '0.00'}</span>
            </div>
            <div className="text-sm opacity-80 mt-1 font-light">Quota</div>
          </div>
          <div className="w-px h-10 bg-white/20 mx-4"></div>
          <div className="flex-1 pl-4">
            <div className="text-2xl font-bold">0.00</div>
            <div className="text-sm opacity-80 mt-1 font-light">Today's Earning</div>
          </div>
        </div>

        {/* Menu Links */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            {menuItems.map((item, index) => (
                <button 
                    key={index} 
                    onClick={(e) => { e.preventDefault(); item.action(); }}
                    className="flex w-full items-center justify-between p-4 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.text}`}>
                            <span className="material-icons-round text-xl">{item.icon}</span>
                        </div>
                        <span className="text-gray-700 font-semibold text-sm">{item.label}</span>
                    </div>
                    <span className="material-icons-round text-gray-300 text-xl">chevron_right</span>
                </button>
            ))}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl slide-up text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-icons-round text-3xl text-red-600">logout</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Sign Out?</h2>
                  <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowLogoutModal(false)}
                          className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={() => auth_signOut()}
                          className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors shadow-lg"
                      >
                          Log Out
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AssetsScreen;
