import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db_addTransaction } from '../firebase';
import { Transaction } from '../types';

const Home: React.FC = () => {
  const { userProfile, systemSettings } = useAuth();
  
  // Withdraw States
  const [withdrawEnabled, setWithdrawEnabled] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');

  // Safe defaults
  const inrBalance = userProfile?.inrBalance || 0;
  const balanceDisplay = `₹${inrBalance.toFixed(2)}`;
  const usdtRate = systemSettings?.usdtRate || 102.0;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > inrBalance) {
      alert("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const newTx: Omit<Transaction, 'id'> = {
        userId: userProfile.uid,
        type: 'WITHDRAW',
        amount: withdrawAmount,
        amountInr: withdrawAmount,
        status: 'PENDING',
        date: null,
        description: `Withdraw to ${bankName} (${accountNo})`,
        utr: '' // Not applicable for request
      };

      await db_addTransaction(newTx);
      
      // Reset form and show success
      setAmount('');
      setBankName('');
      setAccountNo('');
      setIfsc('');
      setShowWithdrawForm(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Failed to submit withdrawal request.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* BEGIN: Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10 shadow-sm">
        <div className="w-6"></div> {/* Spacer for centering */}
        <h1 className="text-brand-blue font-extrabold text-lg tracking-wide">UMONEY</h1>
        <button aria-label="Support" className="text-brand-blue hover:opacity-80 transition-opacity">
          <span className="material-icons-round text-2xl">support_agent</span>
        </button>
      </header>
      {/* END: Header */}

      <main className="px-4 space-y-4 pb-24">
        {/* Hero Banner Section */}
        <section className="rounded-xl overflow-hidden shadow-card text-white relative p-4 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABJlLhA70pp2xFeJuevWr8XUUWOau1bfKIUvKTs2ygB03xYZ8IzdgWGt-uG6Pjct4BLQ8nl81Zq4eUo9venMDnJqk2id8M1zukYneoPsQA6N3VdKhYGDwnO7DpfkYby9saPlxKuDs_Y8VczKekty3KcBwO5GsFFihVoO6NQUPtkQiiGmXPPrB7RbAUaZnw-X5B88DoFBcyyBMp_RqYNzhQvmbEWxutjJObwtKmQBxZzMqDCpIvvXCxmQs8kVks_A35OUeRTzTI4-3C')" }}>
          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-blue-500/20 to-transparent"></div>
          <div className="relative z-10 text-center space-y-1">
            <p className="text-xs font-bold italic tracking-wider text-blue-200">DAILY PREMIUM</p>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter drop-shadow-lg" style={{ fontFamily: 'sans-serif', color: '#FFD700', WebkitTextStroke: '1px #B45309' }}>RECHARGE BONUS</h2>
            <div className="flex justify-center my-2">
              <span className="bg-[#F59E0B] text-blue-900 text-[10px] font-bold px-6 py-1.5 rounded-full shadow-md uppercase tracking-wide">
                This bonus is for USDT recharge
              </span>
            </div>
            {/* Table */}
            <div className="mt-4 bg-blue-900/60 backdrop-blur-sm rounded-lg border border-yellow-500/30 overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-blue-900/80 text-yellow-400 font-bold py-1.5 border-b border-yellow-500/30">
                <div>SINGLE RECHARGE</div>
                <div>GET BONUS</div>
              </div>
              <div className="divide-y divide-yellow-500/20 text-white">
                <div className="grid grid-cols-2 py-1.5">
                  <div className="flex items-center justify-center space-x-1"><span>≈</span> <span>50.5 - 100.9 U</span></div>
                  <div className="font-bold text-white">₹100</div>
                </div>
                <div className="grid grid-cols-2 py-1.5">
                  <div className="flex items-center justify-center space-x-1"><span>≈</span> <span>101.0 - 151.4 U</span></div>
                  <div className="font-bold text-white">₹150</div>
                </div>
                <div className="grid grid-cols-2 py-1.5">
                  <div className="flex items-center justify-center space-x-1"><span>≈</span> <span>151.5 - 201.9 U</span></div>
                  <div className="font-bold text-white">₹200</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USDT Rate Card */}
        <section className="bg-white rounded-xl p-4 shadow-card flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-gray-500 text-xs font-medium mb-1">USDT rate</p>
            <p className="text-brand-blue font-bold text-lg mb-3">1 USDT = {usdtRate} INR</p>
            <button className="bg-brand-blue text-white text-xs font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition shadow-lg">
              TOP UP
            </button>
          </div>
          <div className="z-10">
            <img alt="USDT Coin" className="w-16 h-16 object-contain drop-shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyLobRMU6KSWH0jM_vmoDU1uzVXnCsS755sd0yWHzTvl0IC4k12Dy8xG7GRAH_omLst0-65R1QdpnZWcj31PYhlW-LwS3pBDGwTGU-T5k51GW56BosqWEdrXzU1v43x6-JVs7SC0HKyTORIfFYm4-kIYYUYbsaX3ASljUBHfBfEsH9tAuSXsF4I5sUmqqz6F8Xn2-crtpJtp_-371U3HrPGamxrJfyiQXa08GNs4nrMrST1xjLGupJK6t37o8xddt8eDaxiDcEtoTg"/>
          </div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
        </section>

        {/* Notification Bar */}
        <section className="bg-orange-400 rounded-full px-4 py-2 flex items-center shadow-sm text-white">
          <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.664A2 2 0 009 13h2.028a2 2 0 002.383-1.44l1-5a2 2 0 00-1.82-2.33l-6.685-.815" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span className="text-sm font-medium truncate">Check out our latest updates!</span>
        </section>

        {/* Daily Recharge Section - Connected to Wallet */}
        <section className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-brand-blue font-semibold text-sm">Wallet Balance :</h2>
              <p className="text-gray-500 font-bold text-lg">{balanceDisplay}</p>
            </div>
            {/* Timer */}
            <div className="flex space-x-1">
              <div className="bg-cyan-500 text-white text-xs font-bold py-1 px-1.5 rounded">1</div>
              <div className="bg-cyan-500 text-white text-xs font-bold py-1 px-1.5 rounded">1</div>
              <span className="text-cyan-500 font-bold">:</span>
              <div className="bg-cyan-500 text-white text-xs font-bold py-1 px-1.5 rounded">0</div>
              <div className="bg-cyan-500 text-white text-xs font-bold py-1 px-1.5 rounded">3</div>
            </div>
          </div>
          
          {/* Horizontal Scrollable Coins */}
          <div className="relative w-full">
            <div className="flex overflow-x-auto no-scrollbar space-x-6 pb-2 items-end">
              {[100, 200, 300, 400, 500, 600, 700].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[40px]">
                  <div className="relative">
                    <img alt="Coin" className="w-10 h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyLobRMU6KSWH0jM_vmoDU1uzVXnCsS755sd0yWHzTvl0IC4k12Dy8xG7GRAH_omLst0-65R1QdpnZWcj31PYhlW-LwS3pBDGwTGU-T5k51GW56BosqWEdrXzU1v43x6-JVs7SC0HKyTORIfFYm4-kIYYUYbsaX3ASljUBHfBfEsH9tAuSXsF4I5sUmqqz6F8Xn2-crtpJtp_-371U3HrPGamxrJfyiQXa08GNs4nrMrST1xjLGupJK6t37o8xddt8eDaxiDcEtoTg"/>
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold px-1 rounded-full border border-white">+</span>
                  </div>
                  <span className="text-[10px] text-brand-blue font-bold mt-1">{val}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Progress Bar */}
          <div className="mt-4 relative">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[5%] rounded-full"></div>
            </div>
            <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-1">
              <span>10k</span><span>20k</span><span>30k</span><span>40k</span><span>50k</span><span>60k</span><span>70k</span><span>80k</span>
            </div>
            <div className="absolute top-[-3px] left-[10%] w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full"></div>
            <div className="absolute top-[-3px] left-[50%] w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full"></div>
          </div>
        </section>

        {/* Withdraw Card */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 shadow-lg text-white transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-sm opacity-90">Withdraw ({withdrawEnabled ? 'Open' : 'Closing'})</h3>
            {/* Toggle Switch */}
            <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
              <input 
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-400 top-0 left-0 transition-all duration-200" 
                id="toggle" 
                name="toggle" 
                type="checkbox"
                checked={withdrawEnabled}
                onChange={(e) => setWithdrawEnabled(e.target.checked)}
              />
              <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-400 cursor-pointer transition-colors duration-200" htmlFor="toggle"></label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-white/20">
              <p className="text-xs text-blue-100 mb-1">In Transaction</p>
              <p className="text-xl font-bold tracking-wide">₹0.00</p>
            </div>
            <div className="pl-2">
              <p className="text-xs text-blue-100 mb-1">Today's Withdraw</p>
              <p className="text-xl font-bold tracking-wide">₹0.00</p>
            </div>
          </div>
          
          {/* Withdraw Option (Visible when toggle is ON) */}
          {withdrawEnabled && (
            <div className="mt-5 pt-4 border-t border-white/20 animate-fade-in flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">Want to withdraw?</p>
                    <p className="text-[10px] text-blue-100">Get money in bank instantly</p>
                </div>
                <button 
                    onClick={() => setShowWithdrawForm(true)}
                    className="bg-white text-blue-700 px-5 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-gray-100 transition-colors transform active:scale-95"
                >
                    Withdraw
                </button>
            </div>
          )}
        </section>

        {/* Help Button */}
        <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-full py-3 px-4 flex items-center justify-center shadow-md transition mb-6">
          <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center mr-3">
            <svg className="h-3 w-3 text-indigo-500 ml-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4l10 6-10 6V4z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium">How to use UMoney to make money</span>
        </button>
      </main>

      {/* Withdraw Form Modal */}
      {showWithdrawForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Withdraw Funds</h2>
                    <button onClick={() => setShowWithdrawForm(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Available Balance</p>
                        <p className="text-xl font-bold text-brand-blue">{balanceDisplay}</p>
                    </div>
                    <span className="material-icons-round text-brand-blue opacity-20 text-4xl">account_balance_wallet</span>
                </div>

                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Amount (₹)</label>
                        <input 
                            type="number"
                            required
                            className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Bank Name</label>
                        <input 
                            type="text"
                            required
                            className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                            placeholder="e.g. HDFC Bank"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">Account No.</label>
                            <input 
                                type="text"
                                required
                                className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                                placeholder="************"
                                value={accountNo}
                                onChange={(e) => setAccountNo(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">IFSC Code</label>
                            <input 
                                type="text"
                                required
                                className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none uppercase"
                                placeholder="HDFC0001234"
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-colors mt-2 disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl slide-up text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50">
                    <span className="material-icons-round text-3xl text-green-600">check</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Request Sent!</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Withdraw money will come to your account in 24-48 hours!
                </p>
                <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-3 bg-brand-blue text-white rounded-xl font-semibold shadow-lg hover:bg-blue-900 transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;