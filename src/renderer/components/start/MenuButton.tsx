'use client';

import React from 'react';

interface MenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="w-80 px-8 py-4 text-2xl font-semibold text-theme-text-light bg-theme-text-light/10 rounded-xl backdrop-blur-md shadow-lg border border-theme-text-light/20 hover:bg-theme-text-light/20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-theme-secondary"
    >
      {children}
    </button>
  );
};

export default MenuButton;
