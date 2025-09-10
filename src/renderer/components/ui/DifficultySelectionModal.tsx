/**
 * Difficulty Selection Modal Component
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Zap, Target, Crown } from 'lucide-react';

interface Difficulty {
  name: string;
  filename: string;
  starRating: number;
  difficultyName: string;
}

interface DifficultySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDifficulty: (difficulty: string) => void;
  songTitle: string;
  difficulties: Difficulty[];
  loading?: boolean;
}

export function DifficultySelectionModal({
  isOpen,
  onClose,
  onSelectDifficulty,
  songTitle,
  difficulties,
  loading = false
}: DifficultySelectionModalProps) {
  const getDifficultyIcon = (starRating: number) => {
    if (starRating >= 7) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (starRating >= 5) return <Target className="h-4 w-4 text-red-500" />;
    if (starRating >= 3) return <Zap className="h-4 w-4 text-orange-500" />;
    return <Star className="h-4 w-4 text-blue-500" />;
  };

  const getDifficultyColor = (starRating: number) => {
    if (starRating >= 7) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    if (starRating >= 5) return 'bg-red-500/20 text-red-300 border-red-500/50';
    if (starRating >= 3) return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            난이도 선택
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            <span className="font-medium text-blue-400">{songTitle}</span>의 난이도를 선택하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">난이도 정보 로딩중...</p>
            </div>
          ) : difficulties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">사용 가능한 난이도가 없습니다</p>
              <Button
                variant="outline"
                onClick={onClose}
                className="mt-4"
              >
                닫기
              </Button>
            </div>
          ) : (
            difficulties.map((difficulty) => (
              <div
                key={difficulty.filename}
                className="p-4 border border-gray-700 rounded-lg hover:border-blue-500/50 hover:bg-gray-800/50 transition-all cursor-pointer"
                onClick={() => onSelectDifficulty(difficulty.difficultyName)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDifficultyIcon(difficulty.starRating)}
                    <div>
                      <h3 className="font-medium text-white">
                        {difficulty.difficultyName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {difficulty.name}
                      </p>
                    </div>
                  </div>
                  
                  <span 
                    className={`px-2 py-1 text-xs rounded-md border ${getDifficultyColor(difficulty.starRating)}`}
                  >
                    ★ {difficulty.starRating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
