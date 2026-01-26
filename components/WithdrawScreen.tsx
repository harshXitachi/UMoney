import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db_addTransaction } from '../firebase';
import { Transaction } from '../types';

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
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) {
            setError('You must be logged in to make a withdrawal.');
            return;
        }
        if (parseFloat(amount) > (userProfile.balance || 0)) {
            setError('Insufficient balance.');
            return;
        }
        if (parseFloat(amount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (!bankDetails.accountHolder || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
            setError('Please fill in all bank details.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const newTx: Omit<Transaction, 'id'> = {
                userId: userProfile.uid,
                type: 'WITHDRAWAL',
                amount: parseFloat(amount),
                status: 'PENDING',
                date: null,
                description: `Withdrawal to ${bankDetails.bankName}`,
                bankDetails: bankDetails
            };
            await db_addTransaction(newTx);
            setSuccess(true);
            setAmount('');
        } catch (e) {
            setError('Error processing withdrawal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!userProfile) {
        return (
            <div className="p-4 bg-white min-h-screen">
                <p>Loading user profile...</p>
                 <button onClick={() => navigate(-1)} className="text-indigo-600">
                    Go Back
                 </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white min-h-screen">
            <div className="flex items-center mb-4">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-600">
                    <span className="material-icons-round">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Withdraw Funds</h1>
            </div>

            <div className="mb-4">
                <h2 className="text-xl">Your Wallet Balance: ₹{(userProfile.balance || 0).toFixed(2)}</h2>
            </div>

            {error && <div className="bg-red-500 text-white p-3 rounded-md my-4">{error}</div>}
            {success && (
                <div className="bg-green-500 text-white p-3 rounded-md my-4">
                    Withdrawal request submitted successfully! It will be processed within 24-42 hours.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Amount to Withdraw</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter amount"
                    />
                </div>

                <div className="space-y-4 border-t pt-4 mt-6">
                    <h2 className="text-xl font-semibold mb-2">Bank Account Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                        <input
                            type="text"
                            value={bankDetails.accountHolder}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <input
                            type="text"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input
                            type="text"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                        <input
                            type="text"
                            value={bankDetails.ifscCode}
                            onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
                </button>
            </form>
        </div>
    );
};

export default WithdrawScreen;
