import React, { useState, useEffect } from 'react';
import { db_getAllUsers, db_getAllTransactions, db_adminProcessTransaction, db_banUser, db_unbanUser, db_updateSystemSettings, auth_signOut } from '../firebase';
import { UserProfile, Transaction, SystemSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';

type AdminTab = 'DASHBOARD' | 'DEPOSITS' | 'WITHDRAWALS' | 'USERS' | 'SETTINGS';

const AdminPanel: React.FC = () => {
  const { systemSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  
  // Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, pendingDep: 0, pendingWd: 0, totalDep: 0 });

  // Settings State
  const [settingsForm, setSettingsForm] = useState<SystemSettings>({
      usdtRate: 0, maintenanceMode: false, adminUpi: '', adminQrCode: '', inrPaymentEnabled: true, usdtPaymentEnabled: true
  });

  useEffect(() => {
    fetchData();
    if(systemSettings) setSettingsForm(systemSettings);
  }, [systemSettings, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [u, t] = await Promise.all([db_getAllUsers(), db_getAllTransactions()]);
        setUsers(u);
        setTransactions(t);
        
        // Calc Stats
        const pendingDep = t.filter(x => x.status === 'PENDING' && x.type.includes('DEPOSIT')).length;
        const pendingWd = t.filter(x => x.status === 'PENDING' && x.type === 'WITHDRAW').length;
        const totalDep = t.filter(x => x.status === 'APPROVED' && x.type.includes('DEPOSIT'))
                          .reduce((sum, x) => sum + (x.amountInr || x.amount), 0);

        setStats({ totalUsers: u.length, pendingDep, pendingWd, totalDep });
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const handleProcessTx = async (id: string, action: 'APPROVE' | 'REJECT') => {
      if(!confirm(`Are you sure you want to ${action} this transaction?`)) return;
      await db_adminProcessTransaction(id, action);
      fetchData(); // Refresh
  };

  const handleBan = async (uid: string, days: number) => {
      const seconds = days === -1 ? -1 : days * 24 * 60 * 60;
      await db_banUser(uid, seconds);
      fetchData();
  };

  const handleSaveSettings = async () => {
      await db_updateSystemSettings(settingsForm);
      alert("System Settings Updated!");
  };

  // --- SUB COMPONENTS ---

  const renderDashboard = () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-xs font-bold uppercase">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-xs font-bold uppercase">Pending Deposits</p>
              <p className="text-2xl font-bold text-orange-500">{stats.pendingDep}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-xs font-bold uppercase">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-red-500">{stats.pendingWd}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-xs font-bold uppercase">Total Deposit Value</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalDep.toLocaleString()}</p>
          </div>
      </div>
  );

  const renderTxTable = (type: 'DEPOSIT' | 'WITHDRAW') => {
      const filtered = transactions.filter(t => type === 'DEPOSIT' ? t.type.includes('DEPOSIT') : t.type === 'WITHDRAW');
      return (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                          <tr>
                              <th className="p-4">Date</th>
                              <th className="p-4">User</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4">Method/UTR</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {filtered.map(tx => {
                              const user = users.find(u => u.uid === tx.userId);
                              return (
                                  <tr key={tx.id} className="hover:bg-gray-50">
                                      <td className="p-4 text-gray-500 text-xs">
                                          {tx.date?.seconds ? new Date(tx.date.seconds * 1000).toLocaleString() : 'Just now'}
                                      </td>
                                      <td className="p-4">
                                          <div className="font-medium text-gray-900">{user?.email || tx.userId}</div>
                                          <div className="text-xs text-gray-400">{user?.phone || 'No phone'}</div>
                                      </td>
                                      <td className="p-4 font-bold">
                                          {type === 'WITHDRAW' ? <span className="text-red-600">-</span> : <span className="text-green-600">+</span>}
                                          {tx.amountInr ? `₹${tx.amountInr}` : `${tx.amount} ${tx.type.includes('USDT') ? 'USDT' : 'INR'}`}
                                      </td>
                                      <td className="p-4 text-xs font-mono text-gray-500">
                                          {tx.type}<br/>
                                          {tx.utr || 'N/A'}
                                      </td>
                                      <td className="p-4">
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                                              tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                              tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                              'bg-orange-100 text-orange-700'
                                          }`}>{tx.status}</span>
                                      </td>
                                      <td className="p-4 text-right space-x-2">
                                          {tx.status === 'PENDING' && (
                                              <>
                                                  <button onClick={() => handleProcessTx(tx.id, 'APPROVE')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs font-bold">Approve</button>
                                                  <button onClick={() => handleProcessTx(tx.id, 'REJECT')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-bold">Reject</button>
                                              </>
                                          )}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  const renderUsers = () => (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                  <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Balance</th>
                      <th className="p-4">Location (IP)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                      <tr key={u.uid} className="hover:bg-gray-50">
                          <td className="p-4">
                              <div className="font-bold text-gray-900">{u.email}</div>
                              <div className="text-xs text-gray-500">Code: {u.referralCode}</div>
                          </td>
                          <td className="p-4">
                              <div className="text-green-600 font-medium">₹{u.inrBalance.toFixed(2)}</div>
                              <div className="text-blue-600 text-xs">{u.usdtBalance.toFixed(2)} USDT</div>
                          </td>
                          <td className="p-4 text-xs">
                              {u.lastLocation ? (
                                  <>
                                      <div className="font-semibold">{u.lastLocation.city}, {u.lastLocation.country}</div>
                                      <div className="text-gray-400">{u.lastLocation.ip}</div>
                                  </>
                              ) : 'Unknown'}
                          </td>
                          <td className="p-4">
                              {u.isBanned ? <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">BANNED</span> : <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">ACTIVE</span>}
                          </td>
                          <td className="p-4 text-right space-x-1">
                              {u.isBanned ? (
                                  <button onClick={() => db_unbanUser(u.uid).then(fetchData)} className="bg-gray-500 text-white px-3 py-1 rounded text-xs">Unban</button>
                              ) : (
                                  <div className="flex justify-end gap-1">
                                      <button onClick={() => handleBan(u.uid, 1)} className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200">1 Day</button>
                                      <button onClick={() => handleBan(u.uid, -1)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">Perm</button>
                                  </div>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderSettings = () => (
      <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-4">System Configuration</h3>
              
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                      <span className="font-bold text-gray-800 block">Maintenance Mode</span>
                      <span className="text-xs text-gray-500">When active, users cannot access the app.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settingsForm.maintenanceMode} onChange={e => setSettingsForm({...settingsForm, maintenanceMode: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Global USDT Rate (INR)</label>
                      <input type="number" value={settingsForm.usdtRate} onChange={e => setSettingsForm({...settingsForm, usdtRate: parseFloat(e.target.value)})} className="w-full border-gray-300 rounded-lg" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Admin UPI ID (Deposit)</label>
                      <input type="text" value={settingsForm.adminUpi} onChange={e => setSettingsForm({...settingsForm, adminUpi: e.target.value})} className="w-full border-gray-300 rounded-lg" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">QR Code Data/URL</label>
                      <input type="text" value={settingsForm.adminQrCode} onChange={e => setSettingsForm({...settingsForm, adminQrCode: e.target.value})} className="w-full border-gray-300 rounded-lg" />
                  </div>
              </div>

              <div className="mt-6">
                  <button onClick={handleSaveSettings} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Save System Settings</button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:block">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-wider">ADMIN PANEL</h1>
                <p className="text-xs text-slate-400">UMoney Management</p>
            </div>
            <nav className="px-2 space-y-1">
                {[
                    {id: 'DASHBOARD', icon: 'dashboard', label: 'Overview'},
                    {id: 'DEPOSITS', icon: 'payments', label: 'Deposits (INR)'},
                    {id: 'WITHDRAWALS', icon: 'account_balance_wallet', label: 'Withdrawals'},
                    {id: 'USERS', icon: 'people', label: 'User Management'},
                    {id: 'SETTINGS', icon: 'settings', label: 'System Settings'},
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as AdminTab)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <span className="material-icons-round">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 mt-auto">
                <button onClick={() => auth_signOut()} className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold">
                    <span className="material-icons-round text-sm">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="bg-white shadow-sm z-10 p-4 flex justify-between md:hidden">
                <span className="font-bold">Admin Panel</span>
                <button onClick={() => auth_signOut()} className="text-red-600 font-bold text-sm">Logout</button>
            </header>
            
            {/* Mobile Tabs */}
            <div className="md:hidden flex overflow-x-auto bg-slate-900 text-white p-2 gap-2">
                 {['DASHBOARD', 'DEPOSITS', 'WITHDRAWALS', 'USERS', 'SETTINGS'].map(tab => (
                     <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-3 py-1 rounded text-xs ${activeTab === tab ? 'bg-blue-600' : 'bg-slate-800'}`}>
                         {tab}
                     </button>
                 ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('_', ' ').toLowerCase()}</h2>
                    <button onClick={fetchData} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                        <span className={`material-icons-round text-blue-600 ${loading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>

                {activeTab === 'DASHBOARD' && renderDashboard()}
                {activeTab === 'DEPOSITS' && renderTxTable('DEPOSIT')}
                {activeTab === 'WITHDRAWALS' && renderTxTable('WITHDRAW')}
                {activeTab === 'USERS' && renderUsers()}
                {activeTab === 'SETTINGS' && renderSettings()}
            </main>
        </div>
    </div>
  );
};

export default AdminPanel;