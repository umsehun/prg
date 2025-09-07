// src/renderer/components/ui/PauseMenu.tsx
'use client';

import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onBackToMenu
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          일시정지
        </h2>
        
        <div className="space-y-4 min-w-[200px]">
          <button
            onClick={onResume}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            계속하기
          </button>
          
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            다시시작
          </button>
          
          <button
            onClick={onBackToMenu}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold text-white transition-colors"
          >
            메뉴로
          </button>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-6">
          ESC 키를 눌러 계속하기
        </p>
      </div>
    </div>
  );
};
