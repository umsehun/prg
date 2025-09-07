'use client';

import React from 'react';
import { JudgmentCounts, Judgment } from '../../../shared/types';

interface JudgmentDetailsProps {
  judgments: JudgmentCounts;
}

const judgmentStyles: Record<Judgment, string> = {
  KOOL: 'text-theme-highlight',
  COOL: 'text-theme-primary',
  GOOD: 'text-green-400',
  MISS: 'text-theme-accent',
};

const JudgmentDetails: React.FC<JudgmentDetailsProps> = ({ judgments }) => {
  const judgmentOrder: Judgment[] = ['KOOL', 'COOL', 'GOOD', 'MISS'];

  return (
    <div className="grid grid-cols-4 gap-4 text-center">
      {judgmentOrder.map((key) => (
        <div key={key}>
          <p className={`text-lg ${judgmentStyles[key]} font-bold`}>{key}</p>
          <p className="text-3xl font-semibold text-theme-text-light">
            {judgments[key]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default JudgmentDetails;
