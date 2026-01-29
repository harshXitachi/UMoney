
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db_updateUserProfile, db_ensureProfile } from '../firebase';

// Helper to generate a random UPI ID
const generateRandomUpiId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${result}@ybl`;
};

// Helper to generate random phone number
const generateRandomPhone = () => {
    const prefixes = ['7', '8', '9'];
    let phone = prefixes[Math.floor(Math.random() * prefixes.length)];
    for (let i = 0; i < 9; i++) {
        phone += Math.floor(Math.random() * 10);
    }
    return phone;
};

// Provider logos/icons
const providerIcons = {
    'PhonePe': (
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">₹</span>
        </div>
    ),
    'Google Pay': (
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
            <span className="font-bold text-sm" style={{ background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</span>
        </div>
    ),
    'Paytm': (
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
        </div>
    )
};

// Main Component
const ToolScreen = () => {
    const navigate = useNavigate();
    const { userProfile, loading: userLoading, currentUser } = useAuth();

    // State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showOperationModal, setShowOperationModal] = useState(false);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('PhonePe');
    const [upiId, setUpiId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [retrying, setRetrying] = useState(false);

    const linked = useMemo(() => userProfile?.linkedAccount, [userProfile]);

    const handleLink = async () => {
        if (!upiId) {
            setError('Please enter a valid UPI ID.');
            return;
        }
        setLinking(true);
        setError('');
        try {
            const newLink = {
                provider: selectedProvider,
                upiId: upiId,
                phoneNumber: phoneNumber || generateRandomPhone(),
                linkedAt: new Date().toISOString(),
                operateEnabled: false,
                verificationStatus: 'VERIFIED'
            };
            await db_updateUserProfile(userProfile.uid, { linkedAccount: newLink });
            setShowAddModal(false);
        } catch (e) {
            setError('Failed to link account. Please try again.');
            console.error(e);
        } finally {
            setLinking(false);
        }
    };

    const handleToggleOperate = async () => {
        if (!linked) return;
        await db_updateUserProfile(userProfile.uid, {
            'linkedAccount.operateEnabled': !linked.operateEnabled
        });
        setShowOperationModal(false);
    };

    const handleConnect = async () => {
        // Reconnect wallet automatically
        setShowOperationModal(false);
        if (linked && !linked.operateEnabled) {
            await handleToggleOperate();
        }
    };

    const handleAuthorize = () => {
        // Manual authorization process - just close modal for now
        setShowOperationModal(false);
    };

    if (userLoading) {
        return <div className="p-4"><p>Loading...</p></div>;
    }

    const handleRetryProfile = async () => {
        if (!currentUser) return;
        setRetrying(true);
        try {
            await db_ensureProfile(currentUser.uid, currentUser.email || '');
            window.location.reload();
        } catch (e) {
            console.error("Failed to create profile", e);
            let errorMsg = "Failed to recover profile.";
            if (e.code === 'permission-denied' || e.message?.includes('permission')) {
                errorMsg = "Permission denied. Please check Firestore security rules. See FIRESTORE_SETUP.md for instructions.";
            } else if (e.message) {
                errorMsg = `Error: ${e.message}`;
            }
            alert(errorMsg);
        } finally {
            setRetrying(false);
        }
    };

    if (!userProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <span className="material-icons-round text-5xl text-gray-300 mb-4">account_circle</span>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Not Found</h3>
                <p className="text-gray-500 mb-6 max-w-xs">
                    We couldn't load your user profile. This might happen if your account setup was interrupted.
                </p>
                <button
                    onClick={handleRetryProfile}
                    disabled={retrying}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    {retrying ? 'Creating Profile...' : 'Create Profile & Retry'}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
                <div className="w-6"></div>
                <h1 className="text-lg font-bold text-gray-800">Tools</h1>
                <button
                    aria-label="Support"
                    className="w-6 h-6 text-indigo-600"
                    onClick={() => navigate('/assets?view=support')}
                >
                    <span className="material-icons-round text-2xl">support_agent</span>
                </button>
            </header>

            <div className="p-4 space-y-4">
                {/* Connected Wallet Card */}
                {linked && (
                    <div
                        className="rounded-2xl p-4 shadow-lg text-white relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)' }}
                    >
                        {/* Watermark */}
                        <div className="absolute right-4 bottom-2 text-white/20 text-4xl font-bold tracking-widest">
                            {linked.provider === 'PhonePe' ? 'PhonePe' : linked.provider === 'Google Pay' ? 'GPay' : 'Paytm'}
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-3">
                                {/* Provider Icon */}
                                {providerIcons[linked.provider] || providerIcons['PhonePe']}

                                <div>
                                    <p className="font-semibold text-sm">{linked.upiId}</p>
                                    <p className="text-white/70 text-xs">{linked.phoneNumber || '9851805067'}</p>
                                </div>
                            </div>

                            {/* Operate/Stop Button */}
                            {linked.operateEnabled ? (
                                <button
                                    onClick={() => setShowOperationModal(true)}
                                    className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-md hover:bg-red-600 transition-all flex items-center gap-1"
                                >
                                    <span className="material-icons-round text-sm">stop</span>
                                    STOP
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowOperationModal(true)}
                                    className="px-4 py-1.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md hover:from-orange-500 hover:to-orange-600 transition-all"
                                >
                                    Operate
                                </button>
                            )}
                        </div>

                        {/* Info Banner */}
                        <div className="mt-4 bg-white/10 rounded-lg px-3 py-2 flex items-center text-xs text-white/80">
                            <span className="material-icons-round text-sm mr-2">info</span>
                            Please relink tool or modify the upi and relink.
                        </div>
                    </div>
                )}

                {/* Empty State when no wallet */}
                {!linked && (
                    <div className="text-center py-16">
                        <span className="material-icons-outlined text-6xl text-gray-300 mb-4">account_balance_wallet</span>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">No Wallet Connected</h2>
                        <p className="text-sm text-gray-500 mb-6">Tap the + button to connect a wallet</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    setUpiId(generateRandomUpiId());
                    setPhoneNumber(generateRandomPhone());
                    setShowAddModal(true);
                }}
                className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all z-40"
            >
                <span className="material-icons-round text-3xl">add</span>
            </button>

            {/* Add Wallet Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Connect Wallet</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Provider Selection */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-2 block">Select Wallet</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['PhonePe', 'Google Pay', 'Paytm'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedProvider(p)}
                                            className={`py-3 px-2 text-xs font-semibold rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedProvider === p
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            {providerIcons[p]}
                                            <span>{p}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* UPI ID Input */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">UPI ID</label>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="yourname@ybl"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Phone Number Input */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="9876543210"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
                            )}

                            <button
                                onClick={handleLink}
                                disabled={linking}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {linking ? (
                                    <>
                                        <span className="material-icons-round animate-spin text-lg mr-2">sync</span>
                                        Connecting...
                                    </>
                                ) : 'Connect Wallet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Operation Modal (Bottom Sheet) */}
            {showOperationModal && linked && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Select Operation</h2>
                            <button
                                onClick={() => setShowOperationModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        {/* Connected Wallet Info */}
                        <div
                            className="rounded-xl p-4 mb-6"
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' }}
                        >
                            <div className="flex items-center space-x-3 text-white">
                                {providerIcons[linked.provider] || providerIcons['PhonePe']}
                                <div>
                                    <p className="font-semibold text-sm">{linked.upiId}</p>
                                    <p className="text-white/70 text-xs">Phone: {linked.phoneNumber || '9851805067'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Operation Options */}
                        <div className="space-y-3">
                            <button
                                onClick={handleConnect}
                                className="w-full p-4 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-all"
                            >
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="material-icons-round text-indigo-600">link</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800">Connect</p>
                                    <p className="text-xs text-gray-500">Reconnect wallet automatically</p>
                                </div>
                            </button>

                            <button
                                onClick={handleAuthorize}
                                className="w-full p-4 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-all"
                            >
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="material-icons-round text-orange-600">verified_user</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800">Authorize</p>
                                    <p className="text-xs text-gray-500">Manual authorization process</p>
                                </div>
                            </button>

                            {/* Toggle Operation Button */}
                            <button
                                onClick={handleToggleOperate}
                                className={`w-full py-3 mt-4 text-white font-semibold rounded-xl shadow-md transition-all ${linked.operateEnabled
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                {linked.operateEnabled ? 'Stop Operation' : 'Start Operation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slide up animation style */}
            <style>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ToolScreen;
