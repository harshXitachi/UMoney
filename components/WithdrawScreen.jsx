import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db_addTransaction } from '../firebase';

const WithdrawScreen = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [bankDetails, setBankDetails] = useState({
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: ''
    });
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const walletBalance = userProfile?.inrBalance || 0;
    const minWithdraw = 100;
    const maxWithdraw = 50000;

    const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!userProfile) {
            setError('You must be logged in to make a withdrawal.');
            return;
        }

        const withdrawAmount = parseFloat(amount);

        if (!withdrawAmount || withdrawAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        if (withdrawAmount < minWithdraw) {
            setError(`Minimum withdrawal is ₹${minWithdraw}`);
            return;
        }

        if (withdrawAmount > maxWithdraw) {
            setError(`Maximum withdrawal is ₹${maxWithdraw}`);
            return;
        }

        if (withdrawAmount > walletBalance) {
            setError('Insufficient balance in your wallet.');
            return;
        }

        if (!bankDetails.accountHolder || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
            setError('Please fill in all bank details.');
            return;
        }

        setLoading(true);

        try {
            const newTx = {
                userId: userProfile.uid,
                type: 'WITHDRAW',
                amount: withdrawAmount,
                status: 'PENDING',
                date: null,
                description: `Withdrawal to ${bankDetails.bankName} - ${bankDetails.accountNumber.slice(-4)}`,
                bankDetails: bankDetails
            };
            await db_addTransaction(newTx);
            setShowSuccessModal(true);
            setAmount('');
            setBankDetails({ accountHolder: '', bankName: '', accountNumber: '', ifscCode: '' });
        } catch (e) {
            console.error('Withdrawal error:', e);
            setError('Error processing withdrawal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!userProfile) {
        return (
            <div className="min-h-screen bg-[#f3f4f8] flex items-center justify-center">
                <div className="text-center">
                    <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mb-4"></span>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f4f8] font-sans pb-24">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-12 pb-8 px-5 rounded-b-[2rem] shadow-lg">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <span className="material-icons-round text-white">arrow_back</span>
                    </button>
                    <h1 className="text-white text-xl font-bold tracking-wide">Withdraw Funds</h1>
                </div>

                {/* Balance Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Available Balance</p>
                            <p className="text-white text-3xl font-bold">₹{walletBalance.toFixed(2)}</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="material-icons-round text-white text-2xl">account_balance_wallet</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-white/70">
                        <span>Min: ₹{minWithdraw}</span>
                        <span>•</span>
                        <span>Max: ₹{maxWithdraw}</span>
                        <span>•</span>
                        <span>Fee: 0%</span>
                    </div>
                </div>
            </header>

            <main className="px-4 -mt-4">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-shake">
                        <span className="material-icons-round text-sm">error</span>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Amount Section */}
                <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                        Withdrawal Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {quickAmounts.map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setAmount(amt.toString())}
                                disabled={amt > walletBalance}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${parseFloat(amount) === amt
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : amt > walletBalance
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                ₹{amt.toLocaleString()}
                            </button>
                        ))}
                        <button
                            onClick={() => setAmount(walletBalance.toString())}
                            disabled={walletBalance < minWithdraw}
                            className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md transition-all disabled:opacity-50"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-icons-round text-blue-600">account_balance</span>
                        <h2 className="text-lg font-bold text-gray-800">Bank Account Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                Account Holder Name
                            </label>
                            <input
                                type="text"
                                value={bankDetails.accountHolder}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="Enter full name as per bank"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                Bank Name
                            </label>
                            <input
                                type="text"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="e.g. State Bank of India"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Account number"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.ifscCode}
                                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                                    placeholder="SBIN0001234"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="material-icons-round text-amber-500 mt-0.5">info</span>
                        <div>
                            <p className="text-sm font-bold text-amber-800 mb-1">Processing Time</p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Withdrawal requests are processed within 24-48 hours after admin approval.
                                Ensure your bank details are correct to avoid delays.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-icons-round">send</span>
                            <span>Submit Withdrawal Request</span>
                        </>
                    )}
                </button>
            </main>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-icons-round text-4xl text-green-600">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Request Submitted!</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Your withdrawal request has been submitted successfully.
                            Admin will review and process it within 24-48 hours.
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-bold text-gray-800">₹{parseFloat(amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="text-orange-500 font-bold">Pending Approval</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/');
                            }}
                            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawScreen;