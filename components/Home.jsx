import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const navigate = useNavigate();

  const handleWithdrawClick = () => {
    navigate('/withdraw');
  };

  return (
    <div className="bg-brand-bg text-gray-800 font-sans antialiased min-h-screen relative pb-32">
      {/* BEGIN: Header */}
      {/* Top header with app title and support icon */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10 shadow-sm">
        <div className="w-6"></div> {/* Spacer for centering */}
        <h1 className="text-brand-blue font-extrabold text-lg tracking-wide">UMONEY</h1>
        <button aria-label="Support" className="w-6 h-6 text-brand-blue">
          {/* Headset Icon SVG */}
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
      </header>
      {/* END: Header */}

      {/* BEGIN: Main Content */}
      <main className="px-4 pt-4 space-y-4">
        {/* Hero Banner Section */}
        {/* Displays the main promotional image */}
        <section className="rounded-xl overflow-hidden shadow-card text-white relative p-4" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABJlLhA70pp2xFeJuevWr8XUUWOau1bfKIUvKTs2ygB03xYZ8IzdgWGt-uG6Pjct4BLQ8nl81Zq4eUo9venMDnJqk2id8M1zukYneoPsQA6N3VdKhYGDwnO7DpfkYby9saPlxKuDs_Y8VczKekty3KcBwO5GsFFihVoO6NQUPtkQiiGmXPPrB7RbAUaZnw-X5B88DoFBcyyBMp_RqYNzhQvmbEWxutjJObwtKmQBxZzMqDCpIvvXCxmQs8kVks_A35OUeRTzTI4-3C')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {/* Background effects */}
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
        {/* Shows current exchange rate and action to top up */}
        <section className="bg-white rounded-xl p-4 shadow-card flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-gray-500 text-xs font-medium mb-1">USDT rate</p>
            <p className="text-brand-blue font-bold text-lg mb-3">1 USDT = 102.0 INR</p>
            <button className="bg-brand-blue text-white text-xs font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition shadow-lg">
              TOP UP
            </button>
          </div>
          {/* Gold Coin Illustration */}
          <div className="z-10">
            <img alt="USDT Coin" className="w-16 h-16 object-contain drop-shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyLobRMU6KSWH0jM_vmoDU1uzVXnCsS755sd0yWHzTvl0IC4k12Dy8xG7GRAH_omLst0-65R1QdpnZWcj31PYhlW-LwS3pBDGwTGU-T5k51GW56BosqWEdrXzU1v43x6-JVs7SC0HKyTORIfFYm4-kIYYUYbsaX3ASljUBHfBfEsH9tAuSXsF4I5sUmqqz6F8Xn2-crtpJtp_-371U3HrPGamxrJfyiQXa08GNs4nrMrST1xjLGupJK6t37o8xddt8eDaxiDcEtoTg" />
          </div>
          {/* Decorative background blur effect */}
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
        </section>

        {/* Notification Bar */}
        {/* Alert or announcement bar */}
        <section className="bg-orange-400 rounded-full px-4 py-2 flex items-center shadow-sm text-white">
          <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.664A2 2 0 009 13h2.028a2 2 0 002.383-1.44l1-5a2 2 0 00-1.82-2.33l-6.685-.815" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          <span className="text-sm font-medium truncate">Check out our latest updates!</span>
        </section>

        {/* Daily Recharge Section */}
        {/* Complex component with horizontal scrolling coin list and progress bar */}
        <section className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-brand-blue font-semibold text-sm">Daily Total Recharge :</h2>
              <p className="text-gray-500 font-bold text-lg">₹0.00</p>
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
              {/* Coin Items */}
              {[100, 200, 300, 400, 500, 600, 700].map(amount => (
                <div key={amount} className="flex flex-col items-center min-w-[40px]">
                  <div className="relative">
                    <img alt="Coin" className="w-10 h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyLobRMU6KSWH0jM_vmoDU1uzVXnCsS755sd0yWHzTvl0IC4k12Dy8xG7GRAH_omLst0-65R1QdpnZWcj31PYhlW-LwS3pBDGwTGU-T5k51GW56BosqWEdrXzU1v43x6-JVs7SC0HKyTORIfFYm4-kIYYUYbsaX3ASljUBHfBfEsH9tAuSXsF4I5sUmqqz6F8Xn2-crtpJtp_-371U3HrPGamxrJfyiQXa08GNs4nrMrST1xjLGupJK6t37o8xddt8eDaxiDcEtoTg" />
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold px-1 rounded-full border border-white">+</span>
                  </div>
                  <span className="text-[10px] text-brand-blue font-bold mt-1">{amount}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Custom Progress Bar */}
          <div className="mt-4 relative">
            {/* Track */}
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[5%] rounded-full"></div>
            </div>
            {/* Progress Indicators (Static Visuals) */}
            <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-1">
              {['10k', '20k', '30k', '40k', '50k', '60k', '70k', '80k'].map(label => <span key={label}>{label}</span>)}
            </div>
            {/* Knobs on track (Decorative) */}
            <div className="absolute top-[-3px] left-[10%] w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full"></div>
            <div className="absolute top-[-3px] left-[50%] w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full"></div>
          </div>
        </section>

        {/* Withdraw Card */}
        {/* Main financial status card with deep blue gradient background */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 shadow-lg text-white" style={{ background: 'linear-gradient(to right, #4facfe, #00f2fe)'}}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-sm opacity-90">Withdraw (closing)</h3>
            {/* Toggle Switch */}
            <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                name="toggle"
                id="toggle"
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-400"
                checked={showWithdraw}
                onChange={() => setShowWithdraw(!showWithdraw)}
              />
              <label
                htmlFor="toggle"
                className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-400 cursor-pointer"
              ></label>
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
          {showWithdraw && (
            <div className="mt-4 text-center">
              <p className="text-white mb-2">Are you sure you want to withdraw?</p>
              <button
                onClick={handleWithdrawClick}
                className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition"
              >
                Withdraw
              </button>
            </div>
          )}
        </section>

        {/* Help Button */}
        {/* Navigational button to help section */}
        <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-full py-3 px-4 flex items-center justify-center shadow-md transition">
          <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center mr-3">
            <svg className="h-3 w-3 text-indigo-500 ml-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4l10 6-10 6V4z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium">How to use UMoney to make money</span>
        </button>
      </main>
      {/* END: Main Content */}
    </div>
  );
};

export default Home;