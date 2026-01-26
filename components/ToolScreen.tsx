import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db_updateUserProfile } from '../firebase';
import { LinkedAccount } from '../types';

const ToolScreen: React.FC = () => {
  const { userProfile } = useAuth();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'PhonePe' | 'Google Pay' | 'Paytm'>('PhonePe');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [operateLoading, setOperateLoading] = useState(false);

  const linked = userProfile?.linkedAccount;

  const handleLinkUPI = async () => {
    if (!upiIdInput) return;
    
    // Basic regex validation for UPI ID (vpa)
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiIdInput)) {
        alert("Please enter a valid UPI ID (e.g., name@bank)");
        return;
    }

    setVerifying(true);
    // Simulate API Verification time
    setTimeout(async () => {
        if (!userProfile) return;
        
        try {
            const newAccount: LinkedAccount = {
                provider: selectedProvider,
                upiId: upiIdInput,
                status: 'VERIFIED',
                operateEnabled: false,
                linkedAt: new Date().toISOString()
            };
            
            await db_updateUserProfile(userProfile.uid, { linkedAccount: newAccount });
            setVerifying(false);
            setShowLinkModal(false);
            setUpiIdInput('');
        } catch (e) {
            alert('Failed to link account');
            setVerifying(false);
        }
    }, 2000);
  };

  const toggleOperate = async () => {
    if (!userProfile || !linked) return;
    setOperateLoading(true);
    try {
        await db_updateUserProfile(userProfile.uid, {
            linkedAccount: {
                ...linked,
                operateEnabled: !linked.operateEnabled
            }
        });
    } catch (e) {
        console.error(e);
    }
    setOperateLoading(false);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen relative flex flex-col font-sans">
      {/* BEGIN: Header */}
      <header className="flex justify-between items-center px-6 py-5 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
        <button className="p-1 focus:outline-none text-gray-700 hover:text-blue-600 transition-colors">
          <span className="material-icons-round text-2xl">support_agent</span>
        </button>
      </header>
      {/* END: Header */}

      {/* BEGIN: MainContent */}
      <main className="flex-grow px-4 py-4 pb-32">
        {linked ? (
            /* Linked Card */
            <div className="rounded-3xl p-0 shadow-lg text-white overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4a148c, #6a1b9a)' }}>
              {/* Top Section of Card */}
              <div className="flex justify-between items-start p-5 pb-16">
                <div className="flex items-center gap-3">
                  {/* Logo Circle Placeholder */}
                  <img alt="App Logo" className="w-12 h-12 rounded-full border border-white/10 bg-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnYskm8mrclkPQ2O8N8iRJiWy9Czu4VcewQdvPfiJncT_ZO86V7lnVuRGbSxC6eQI9N92miNCB8WyCps2yN9o-vuP2scJ4iZdMshYecycuQLNZoMLMlwxdOkS-PztLSZrYEA21s6B2cKPMK2Qb3xxR1LELs2zwzXwZkAWmJ5tjXBX1j0sUar1ddwRbQDj0oh1_6k8TqJxq7D346AdFURVLz1Tb-_bBsbq_dk5bdR_TpjGhMoGkqDtWdTbtRw10lv0QvDI3gf1DxII3"/>
                  {/* Text Details */}
                  <div className="flex flex-col">
                    <span className="text-sm text-white tracking-wide font-bold">{linked.upiId}</span>
                    <span className="text-xs text-white/70 mt-0.5">{userProfile?.phone || 'Linked via ' + linked.provider}</span>
                  </div>
                </div>
                {/* Operate Button */}
                <button 
                    onClick={toggleOperate}
                    disabled={operateLoading}
                    className={`text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md transition-colors ${linked.operateEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {operateLoading ? '...' : (linked.operateEnabled ? 'Running' : 'Operate')}
                </button>
              </div>
              {/* Bottom Overlay Section */}
              <div className="mx-3 mb-3">
                <div className="rounded-xl p-3 flex items-center gap-3 text-xs text-white/90" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)' }}>
                   {linked.operateEnabled ? (
                      <>
                        <span className="material-icons-round text-green-400">check_circle</span>
                        <span className="leading-snug">Tool is active. Automatic payments enabled.</span>
                      </>
                   ) : (
                      <>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <span className="leading-snug">Click Operate to enable transactions.</span>
                      </>
                   )}
                </div>
              </div>
              {/* Decorative background text */}
              <div className="absolute bottom-2 right-4 text-6xl font-bold text-white opacity-10 pointer-events-none select-none">
                {linked.provider.split(' ')[0]}
              </div>
            </div>
        ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="material-icons-round text-4xl mb-2">link_off</span>
                <p>No Tool Linked</p>
                <p className="text-xs">Click + to connect a payment tool</p>
            </div>
        )}
      </main>
      {/* END: MainContent */}

      {/* BEGIN: Floating Action Button (FAB) */}
      {!linked && (
        <div className="fixed bottom-24 right-6 z-20">
            <button 
                onClick={() => setShowLinkModal(true)}
                className="text-white w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center hover:bg-blue-800 transition-transform active:scale-95" style={{ backgroundColor: '#3b5998' }}
            >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            </button>
        </div>
      )}
      {/* END: Floating Action Button */}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl slide-up">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Connect UPI Tool</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Select App</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['PhonePe', 'Google Pay', 'Paytm'].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => setSelectedProvider(p as any)}
                                    className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all ${selectedProvider === p ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                         <label className="text-xs font-semibold text-gray-500 mb-1 block">UPI ID (VPA)</label>
                         <input 
                            type="text" 
                            placeholder="e.g. 9876543210@ybl"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={upiIdInput}
                            onChange={(e) => setUpiIdInput(e.target.value)}
                         />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-2">
                        <span className="material-icons-round text-yellow-600 text-sm mt-0.5">verified_user</span>
                        <p className="text-[10px] text-yellow-800 leading-tight">
                            We will verify this UPI ID. Ensure your {selectedProvider} app is installed and active on this device.
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={() => setShowLinkModal(false)}
                            className="flex-1 py-3 text-gray-500 font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleLinkUPI}
                            disabled={verifying}
                            className="flex-1 py-3 bg-[#3b5998] text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-70 flex items-center justify-center"
                        >
                            {verifying ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : 'Verify & Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ToolScreen;