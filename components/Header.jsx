import React from 'react';

const Header = () => {
  return (
    <header className="bg-primary pt-12 pb-16 px-5 sticky top-0 z-10 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-lg font-semibold tracking-wide">Team</h1>
        <button className="text-white opacity-90 hover:opacity-100 transition-opacity">
          <span className="material-icons-round text-2xl">support_agent</span>
        </button>
      </div>
    </header>
  );
};

export default Header;