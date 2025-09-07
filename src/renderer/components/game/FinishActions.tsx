// src/renderer/components/game/FinishActions.tsx
'use client';

import React from 'react';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, variant }) => {
  const baseClasses = 'px-8 py-3 rounded-xl transition-all duration-200 font-medium transform hover:scale-105';
  const styles = {
    primary: 'bg-theme-primary/20 hover:bg-theme-primary/30 border border-theme-primary/50 text-theme-primary hover:text-theme-primary/90',
    secondary: 'bg-theme-text-dark/30 hover:bg-theme-text-dark/50 text-theme-text-light/80 hover:text-theme-text-light',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${styles[variant]}`}>
      {label}
    </button>
  );
};

interface FinishActionsProps {
  onRestart: () => void;
  onSelectMusic: () => void;
}

const FinishActions: React.FC<FinishActionsProps> = ({ onRestart, onSelectMusic }) => {
  const actions: ActionButtonProps[] = [
    { label: 'Retry', onClick: onRestart, variant: 'primary' },
    { label: 'Back to Menu', onClick: onSelectMusic, variant: 'secondary' },
  ];

  return (
    <div className="flex justify-center gap-6">
      {actions.map((action) => (
        <ActionButton key={action.label} {...action} />
      ))}
    </div>
  );
};

export default FinishActions;
