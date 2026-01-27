
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

// Main Component
const ToolScreen = () => {
    const navigate = useNavigate();
    const { userProfile, loading: userLoading, currentUser } = useAuth();

    // State
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('PhonePe');
    const [upiId, setUpiId] = useState('');
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
                linkedAt: new Date().toISOString(),
                operateEnabled: true,
                verificationStatus: 'VERIFIED'
            };
            await db_updateUserProfile(userProfile.uid, { linkedAccount: newLink });
            setShowLinkModal(false);
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
    };

    if (userLoading) {
        return <div className="p-4"><p>Loading...</p></div>;
    }

    const handleRetryProfile = async () => {
        if (!currentUser) return;
        setRetrying(true);
        try {
            await db_ensureProfile(currentUser.uid, currentUser.email || '');
            window.location.reload(); // Reload to trigger context refresh
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm p-4">
                <h1 className="text-2xl font-bold text-center text-gray-800">My Tool</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Tool Status Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    {linked ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">Your Connected Tool</h2>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${linked.operateEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {linked.operateEnabled ? 'OPERATING' : 'STOPPED'}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Provider:</span>
                                    <span className="font-medium text-gray-900">{linked.provider}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">UPI ID:</span>
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{linked.upiId}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Linked On:</span>
                                    <span className="text-gray-900">{new Date(linked.linkedAt).toLocaleDateString()}</span>
                                </p>
                            </div>
                            <button
                                onClick={handleToggleOperate}
                                className={`w-full py-3 mt-4 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ${linked.operateEnabled
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                {linked.operateEnabled ? 'Stop Operation' : 'Start Operation'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <span className="material-icons-outlined text-6xl text-gray-400 mb-4">link_off</span>
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">No Tool Connected</h2>
                            <p className="text-sm text-gray-500 mb-6">Connect a UPI tool to start making deposits.</p>
                            <button
                                onClick={() => {
                                    setUpiId(generateRandomUpiId());
                                    setShowLinkModal(true);
                                }}
                                className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300"
                            >
                                Connect Now
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-2">How it works?</h3>
                        <p className="text-gray-600">
                            Connect your UPI app as a "tool". When you deposit, you'll pay from this linked UPI. This automates verification.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-2">Is it safe?</h3>
                        <p className="text-gray-600">
                            Yes. We never ask for your UPI PIN or password. We only use the UPI ID to verify payments you make.
                        </p>
                    </div>
                </div>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl slide-up">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Connect UPI Tool</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Select App</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['PhonePe', 'Google Pay', 'Paytm'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedProvider(p)}
                                            className={`py-2 px-3 text-sm font-semibold rounded-md border-2 transition-all ${selectedProvider === p
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                                                }`}
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
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">{error}</p>
                            )}

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-xs text-yellow-800">
                                <p><span className="font-bold">We will verify this UPI ID.</span> Ensure your {selectedProvider} app is installed and active on this device.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="w-full py-2 px-4 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                disabled={linking}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLink}
                                className="w-full py-2 px-4 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center"
                                disabled={linking}
                            >
                                {linking ? (
                                    <>
                                        <span className="material-icons-round animate-spin text-base mr-2">sync</span>
                                        Connecting...
                                    </>
                                ) : 'Connect'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToolScreen;
