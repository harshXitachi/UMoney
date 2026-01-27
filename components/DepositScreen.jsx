import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { db_addTransaction } from '../firebase.js';

const DepositScreen = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'usdt' ? 'USDT' : 'INR');
  const { userProfile, systemSettings } = useAuth();

  // --- INR Flow State ---
  const [inrStep, setInrStep] = useState('SELECT');
  const [selectedInrOption, setSelectedInrOption] = useState(null);
  const [inrUtr, setInrUtr] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes

  // --- USDT Flow State ---
  const [usdtAmount, setUsdtAmount] = useState('');
  const [depositStep, setDepositStep] = useState('INPUT');
  const [txId, setTxId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Dynamic Settings from Admin
  const MERCHANT_VPA = systemSettings?.adminUpi || "pay.umoney@upi";
  const ADMIN_QR_BASE = systemSettings?.adminQrCode || "https://api.qrserver.com/v1/create-qr-code/?size=200x200";
  const USDT_RATE = systemSettings?.usdtRate || 99.0;

  // USDT Settings from Admin (dynamic)
  const TRC20_ADDRESS = systemSettings?.usdtTrc20Address || "TVjsyZ7sWvJgM8p4G8MockTRC20Address7788";
  const USDT_QR_URL = systemSettings?.usdtQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${TRC20_ADDRESS}`;

  useEffect(() => {
    let interval;
    if (inrStep === 'PAYMENT' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [inrStep, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const depositOptions = [
    { amount: 100, income: 3.00, percent: 3.00, activity: 6.00, quota: 109.00 },
    { amount: 300, income: 9.00, percent: 3.00, activity: 6.00, quota: 315.00 },
    { amount: 310, income: 9.30, percent: 3.00, activity: 6.00, quota: 325.30 },
    { amount: 400, income: 12.00, percent: 3.00, activity: 6.00, quota: 418.00 },
    { amount: 900, income: 27.00, percent: 3.00, activity: 6.00, quota: 933.00 },
    { amount: 1300, income: 39.00, percent: 3.00, activity: 6.00, quota: 1345.00 },
  ];

  // --- INR HANDLERS ---

  const handleBuyInr = async (option) => {
    if (!userProfile) return;

    // 1. Check if Tool is Linked
    const linked = userProfile.linkedAccount;
    if (!linked || linked.verificationStatus !== 'VERIFIED') {
      alert("Please go to 'Tool' tab and link your UPI account first.");
      return;
    }

    // 2. Check if Tool is Operating
    if (!linked.operateEnabled) {
      alert("Your linked tool is not active. Please click 'Operate' in the Tool tab.");
      return;
    }

    // 3. Proceed to Payment Page
    setSelectedInrOption(option);
    setTimer(300); // Reset timer
    setInrStep('PAYMENT');
    window.scrollTo(0, 0);
  };

  const submitInrPayment = async () => {
    if (!inrUtr || inrUtr.length < 10) {
      alert("Please enter a valid 12-digit UTR / Reference ID.");
      return;
    }

    setLoading(true);
    try {
      const newTx = {
        userId: userProfile.uid,
        type: 'DEPOSIT_INR',
        amount: selectedInrOption.amount,
        status: 'PENDING',
        date: null,
        description: `Purchase Quota ${selectedInrOption.amount}`,
        utr: inrUtr
      };
      await db_addTransaction(newTx);
      setShowSuccessModal(true);
      // Reset
      setInrUtr('');
    } catch (e) {
      alert('Error creating transaction. Please try again.');
    }
    setLoading(false);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setInrStep('SELECT');
    setSelectedInrOption(null);
  };

  // --- USDT HANDLERS ---

  const handleUsdtNext = () => {
    if (!userProfile || !usdtAmount) return;
    const amount = parseFloat(usdtAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Invalid amount');
      return;
    }
    setMessage('');
    setDepositStep('PAYMENT');
  };

  const handleUsdtSubmit = async () => {
    if (!txId) {
      setMessage('Please enter the Transaction Hash (TxID)');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(usdtAmount);
      const inrValue = amount * USDT_RATE;
      const newTx = {
        userId: userProfile.uid,
        type: 'DEPOSIT_USDT',
        amount: amount,
        amountInr: inrValue,
        status: 'PENDING',
        date: null,
        description: `Deposit ${amount} USDT`,
        utr: txId
      };
      await db_addTransaction(newTx);
      alert('Deposit Submitted Successfully! Waiting for Admin Approval.');

      setUsdtAmount('');
      setTxId('');
      setDepositStep('INPUT');
      setMessage('');
    } catch (e) {
      setMessage('Error submitting request');
    }
    setLoading(false);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const usdtValue = parseFloat(usdtAmount) || 0;
  const calculatedInr = (usdtValue * USDT_RATE).toFixed(2);

  // Construct QR URL based on whether admin settings provide a raw string or full url
  const qrUrl = ADMIN_QR_BASE.startsWith('http')
    ? ADMIN_QR_BASE // If admin setting is already a URL (e.g. from QR server) use it
    : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${MERCHANT_VPA}&am=${selectedInrOption?.amount}&cu=INR`; // Otherwise construct default

  return (
    <div className="bg-[#f3f4f8] min-h-screen font-sans">
      {/* BEGIN: Header Section */}
      <header className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">
            {activeTab === 'USDT' ? 'Deposit USDT' : 'UMoney Deposit'}
          </h1>
          <button className="text-[#303f9f] p-1 hover:opacity-80 transition-opacity">
            <span className="material-icons-round text-2xl">support_agent</span>
          </button>
        </div>
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => { setActiveTab('INR'); setInrStep('SELECT'); }}
            className={`flex-1 py-3 text-center text-sm font-medium relative focus:outline-none transition-colors ${activeTab === 'INR' ? 'text-app-blue border-b-2 border-app-blue' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {activeTab === 'INR' && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-[2px] w-full h-[2px] bg-app-blue"></div>
            )}
            <span className="flex items-center justify-center gap-1">
              {activeTab === 'INR' && <span className="material-icons-outlined text-lg">currency_rupee</span>}
              INR
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('USDT'); setDepositStep('INPUT'); }}
            className={`flex-1 py-3 text-center text-sm font-medium focus:outline-none transition-colors ${activeTab === 'USDT' ? 'text-[#2546a3] border-b-2 border-[#2546a3]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            USDT
          </button>
        </div>
      </header>
      {/* END: Header Section */}

      <main className="p-3 pb-24">
        {activeTab === 'INR' ? (
          // INR Layout
          <div className="bg-white rounded-3xl p-4 shadow-sm min-h-[80vh]">
            {inrStep === 'SELECT' ? (
              // LIST OF OPTIONS
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Quota</span>
                    <i className="fas fa-info-circle text-gray-300"></i>
                  </div>
                  <a className="text-app-blue text-xs font-medium hover:underline" href="#">How To Buy Quota</a>
                </div>

                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-app-blue">
                    ₹{userProfile?.inrBalance.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2">
                  <button className="bg-app-blue text-white px-4 py-1.5 rounded-lg text-sm font-medium shrink-0 shadow-md">All</button>
                  {[100, 200, 500, 1000, 2000, 5000].map(n => (
                    <button key={n} className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-sm font-medium shrink-0 border border-gray-100">{n}+</button>
                  ))}
                </div>

                <div className="flex flex-col gap-0 divide-y divide-gray-100">
                  {depositOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center justify-between py-4">
                      <div className="mr-3 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-app-blue font-bold text-lg">₹</div>
                      </div>
                      <div className="flex-1 mr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-gray-800">{option.amount.toFixed(2)} INR</span>
                          <span className="bg-badge-bg text-badge-text text-[10px] font-bold px-1 py-0.5 rounded sm:px-1.5">BANK</span>
                        </div>
                        <div className="text-[11px] text-gray-500 leading-tight">
                          Income: ₹ {option.income.toFixed(2)} ({option.percent.toFixed(2)}%) +{option.activity.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <button
                          onClick={() => handleBuyInr(option)}
                          className="bg-app-blue hover:bg-indigo-800 text-white text-sm font-bold py-1.5 px-6 rounded shadow-sm mb-1"
                        >
                          BUY
                        </button>
                        <div className="text-[10px] text-app-green font-medium">
                          Quota: + {option.quota.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // PAYMENT PAGE
              <div className="animate-fade-in">
                <div className="flex items-center mb-4 border-b pb-2">
                  <button onClick={() => setInrStep('SELECT')} className="mr-3 text-gray-600">
                    <span className="material-icons-round">arrow_back</span>
                  </button>
                  <h2 className="text-lg font-bold text-gray-800">Complete Payment</h2>
                </div>

                {/* Amount & Timer */}
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Payable</p>
                    <p className="text-2xl font-bold text-app-blue">₹{selectedInrOption?.amount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
                    <p className="text-xl font-mono font-bold text-orange-500">{formatTime(timer)}</p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 mb-4">
                    {/* Generate QR for Merchant VPA + Amount */}
                    <img
                      src={qrUrl}
                      alt="Payment QR"
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-xs font-bold mb-4">
                    Scan with any UPI App
                  </div>

                  {/* VPA Display */}
                  <div className="w-full bg-gray-50 rounded-lg p-3 flex justify-between items-center mb-2">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Merchant UPI ID</p>
                      <p className="text-sm font-medium text-gray-800">{MERCHANT_VPA}</p>
                    </div>
                    <button onClick={() => copyText(MERCHANT_VPA)} className="text-app-blue p-2">
                      <span className="material-icons-outlined text-sm">content_copy</span>
                    </button>
                  </div>

                  {/* User Verification Warning */}
                  <div className="w-full bg-red-50 border border-red-100 rounded-lg p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <span className="material-icons-outlined text-red-500 text-sm mt-0.5">warning</span>
                      <div>
                        <p className="text-xs font-bold text-red-700">Important Requirement:</p>
                        <p className="text-xs text-red-600 leading-tight mt-1">
                          You must pay using your linked UPI ID: <br />
                          <span className="font-mono bg-white px-1 rounded border border-red-200 mt-1 inline-block">
                            {userProfile?.linkedAccount?.upiId}
                          </span>
                        </p>
                        <p className="text-[10px] text-red-500 mt-1">Payments from other IDs will be rejected.</p>
                      </div>
                    </div>
                  </div>

                  {/* UTR Input */}
                  <div className="w-full">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      UTR / Reference No. (12 Digits)
                    </label>
                    <input
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-app-blue outline-none text-sm transition-all"
                      placeholder="Enter 12-digit UTR number"
                      type="number"
                      value={inrUtr}
                      onChange={(e) => setInrUtr(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-2">
                      After payment, copy the UTR from your UPI app and paste it here.
                    </p>
                  </div>
                </div>

                <button
                  onClick={submitInrPayment}
                  disabled={loading}
                  className="w-full bg-app-blue hover:bg-blue-900 text-white font-semibold py-3.5 rounded-lg shadow-md transition-colors active:scale-[0.98] transform duration-100 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Submit Payment'}
                </button>
              </div>
            )}
          </div>
        ) : (
          // USDT Layout
          <div className="bg-white rounded-[15px] p-4 shadow-sm mx-1 min-h-[80vh]">

            {depositStep === 'INPUT' ? (
              // STEP 1: Amount Input
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-gray-800 font-medium">
                      <span>Quota</span>
                      <i className="fas fa-eye text-[#999] ml-2 text-sm"></i>
                    </div>
                    <a className="text-xs text-[#2546a3] hover:underline" href="#">How To Buy Quota</a>
                  </div>
                  <div className="text-center py-4">
                    <span className="text-[28px] font-bold text-[#1e3a8a]">
                      ₹{userProfile?.inrBalance.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <div className="flex-1 flex items-center bg-[#f5f5f5] rounded-lg px-4 py-3">
                    <input
                      className="flex-1 bg-transparent border-none p-0 text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none text-base w-full"
                      placeholder="0.00"
                      type="number"
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
                    />
                    <span className="text-sm text-gray-500 ml-2 font-medium">USDT</span>
                  </div>
                  <div className="w-auto flex-none bg-[#eef2ff] rounded-lg flex items-center justify-center py-3 px-3">
                    <span className="text-xs font-bold text-[#2546a3] whitespace-nowrap">1 USDT = {USDT_RATE.toFixed(1)} INR</span>
                  </div>
                </div>

                <div className="bg-[#f3f4f6] rounded-lg p-4 mb-6 space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Estimated bonus</span>
                    <span className="text-black font-medium">0 INR</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-800 font-bold">
                    <span>You will receive</span>
                    <span className="text-[#1e3a8a] font-bold">{calculatedInr} INR</span>
                  </div>
                </div>

                {message && !message.includes('TxID') && (
                  <div className="mb-4 text-center text-sm font-medium text-red-600">
                    {message}
                  </div>
                )}

                <button
                  onClick={handleUsdtNext}
                  disabled={loading}
                  className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold py-3.5 rounded-lg shadow-md transition-colors active:scale-[0.98] transform duration-100 disabled:opacity-50"
                >
                  Confirm Amount
                </button>
              </>
            ) : (
              // STEP 2: Payment Proof (QR, Address, TxID)
              <div className="animate-fade-in">
                <div className="flex items-center mb-4">
                  <button onClick={() => setDepositStep('INPUT')} className="mr-3 text-gray-600">
                    <span className="material-icons-round">arrow_back</span>
                  </button>
                  <h2 className="text-lg font-bold text-[#1e3a8a]">Complete Payment</h2>
                </div>

                <div className="bg-[#eef2ff] rounded-lg p-4 mb-6 flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Scan QR to Pay <span className="font-bold text-[#1e3a8a]">{usdtAmount} USDT</span></p>
                  <div className="bg-white p-2 rounded-lg shadow-sm mb-4">
                    {/* Static QR Code API for the TRC20 Address */}
                    <img
                      src={USDT_QR_URL}
                      alt="USDT QR Code"
                      className="w-40 h-40"
                    />
                  </div>

                  <div className="w-full">
                    <label className="text-xs text-gray-500 mb-1 block ml-1">TRC20 Address (TRON)</label>
                    <div className="flex items-center bg-white border border-blue-100 rounded-lg overflow-hidden">
                      <div className="flex-1 py-3 px-3 text-xs font-mono text-gray-700 truncate">
                        {TRC20_ADDRESS}
                      </div>
                      <button
                        onClick={() => copyText(TRC20_ADDRESS)}
                        className="bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] p-3 transition-colors border-l border-blue-100"
                      >
                        <span className="material-icons-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Transaction Hash (TxID)
                  </label>
                  <input
                    className="w-full bg-[#f5f5f5] border-none rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none text-sm"
                    placeholder="Paste the TxID / Hash here..."
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                  />
                </div>

                {message && (
                  <div className={`mb-4 text-center text-sm font-medium ${message.includes('Error') || message.includes('Please') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                  </div>
                )}

                <button
                  onClick={handleUsdtSubmit}
                  disabled={loading}
                  className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold py-3.5 rounded-lg shadow-md transition-colors active:scale-[0.98] transform duration-100 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl slide-up text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-3xl text-green-600">check_circle</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Submitted Successfully</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Your UTR <span className="font-mono font-bold text-gray-800">{inrUtr}</span> has been recorded.
                Please wait for admin confirmation. Your quota will be updated shortly.
              </p>
              <button
                onClick={closeSuccessModal}
                className="w-full py-3 bg-app-blue text-white rounded-xl font-semibold shadow-lg"
              >
                Okay, Got it
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DepositScreen;