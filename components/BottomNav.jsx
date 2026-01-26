import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomNav = ({ currentTab }) => {
  const navigate = useNavigate();
  const activeColor = "text-primary";
  const inactiveColor = "text-gray-400";

  const handleTabChange = (tab) => {
    navigate(`/${tab}`);
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <nav className="bg-white rounded-full shadow-float px-2 py-3 border border-gray-50">
        <ul className="flex justify-between items-center">
          {/* Home */}
          <li className="flex-1">
            <button 
              onClick={() => handleTabChange('home')}
              className="flex flex-col items-center justify-center w-full group focus:outline-none transition-transform active:scale-95"
            >
              <span className={`material-icons-round text-2xl mb-0.5 transition-colors ${currentTab === 'home' ? activeColor : inactiveColor}`}>home</span>
              <span className={`text-[10px] font-medium transition-colors ${currentTab === 'home' ? activeColor : inactiveColor}`}>Home</span>
            </button>
          </li>

          {/* Deposit */}
          <li className="flex-1">
            <button 
              onClick={() => handleTabChange('deposit')}
              className="flex flex-col items-center justify-center w-full group focus:outline-none transition-transform active:scale-95"
            >
              <span className={`material-icons-round text-2xl mb-0.5 transition-colors ${currentTab === 'deposit' ? activeColor : inactiveColor}`}>description</span>
              <span className={`text-[10px] font-medium transition-colors ${currentTab === 'deposit' ? activeColor : inactiveColor}`}>Deposit</span>
            </button>
          </li>

          {/* Tool */}
          <li className="flex-1">
            <button 
              onClick={() => handleTabChange('tool')}
              className="flex flex-col items-center justify-center w-full group focus:outline-none transition-transform active:scale-95"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-0.5 transition-colors ${currentTab === 'tool' ? 'bg-primary text-white' : 'bg-gray-300 text-white'}`}>
                <span className="font-bold text-xs">T</span>
              </div>
              <span className={`text-[10px] font-medium transition-colors ${currentTab === 'tool' ? activeColor : inactiveColor}`}>Tool</span>
            </button>
          </li>

          {/* Teams */}
          <li className="flex-1">
            <button 
              onClick={() => handleTabChange('teams')}
              className="flex flex-col items-center justify-center w-full group focus:outline-none transition-transform active:scale-95"
            >
              <span className={`material-icons-round text-2xl mb-0.5 transition-colors ${currentTab === 'teams' ? activeColor : inactiveColor}`}>groups</span>
              <span className={`text-[10px] font-medium transition-colors ${currentTab === 'teams' ? activeColor : inactiveColor}`}>Teams</span>
            </button>
          </li>

          {/* Assets */}
          <li className="flex-1">
            <button 
              onClick={() => handleTabChange('assets')}
              className="flex flex-col items-center justify-center w-full group focus:outline-none transition-transform active:scale-95"
            >
              <span className={`material-icons-round text-2xl mb-0.5 transition-colors ${currentTab === 'assets' ? activeColor : inactiveColor}`}>person</span>
              <span className={`text-[10px] font-medium transition-colors ${currentTab === 'assets' ? activeColor : inactiveColor}`}>Assets</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default BottomNav;