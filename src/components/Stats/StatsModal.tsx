import { useState } from 'react';
import { Modal, Button } from '../UI';
import { useServices } from '@/di';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const { storageService, statisticsService } = useServices();
  const stats = storageService.getPlayerStats();
  const winRate = statisticsService.getWinRate(stats);
  const avgClues = statisticsService.getAverageClues(stats);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearData = () => {
    if (showConfirm) {
      // Clear all data from all days
      // 1. Clear today's game state
      storageService.clearGameState();

      // 2. Clear all archive game states
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cluedrop_archive_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 3. Clear completed puzzles tracking
      localStorage.removeItem('cluedrop_completed_puzzles');

      // 4. Clear player statistics
      storageService.savePlayerStats({
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        clueDistribution: {},
        lastPlayedDate: '',
      });

      // Reload page to reset UI
      window.location.reload();
    } else {
      setShowConfirm(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Statistics">
      <div className="space-y-6">
        {/* Overall stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Games Played" value={stats.gamesPlayed} />
          <StatCard label="Win Rate" value={`${winRate}%`} />
          <StatCard label="Current Streak" value={stats.currentStreak} icon="🔥" />
          <StatCard label="Max Streak" value={stats.maxStreak} icon="⭐" />
        </div>

        {/* Average clues */}
        {stats.gamesWon > 0 && (
          <div className="bg-primary-50 rounded-lg p-4 text-center">
            <p className="text-sm text-primary-700 font-medium">Average Clues to Win</p>
            <p className="text-3xl font-bold text-primary-900">{avgClues}</p>
          </div>
        )}

        {/* Clue distribution */}
        {stats.gamesWon > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Win Distribution</h3>
            <ClueDistributionChart distribution={stats.clueDistribution} totalWins={stats.gamesWon} />
          </div>
        )}

        {/* Empty state */}
        {stats.gamesPlayed === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No games played yet!</p>
            <p className="text-sm mt-2">Play a puzzle to see your stats here.</p>
          </div>
        )}

        {/* Clear data button */}
        <div className="border-t pt-4">
          <Button
            variant={showConfirm ? 'danger' : 'secondary'}
            size="sm"
            onClick={handleClearData}
            className="w-full"
          >
            {showConfirm ? '⚠️ Click again to confirm' : 'Clear All Data'}
          </Button>
          {!showConfirm && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Reset game state and statistics
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </p>
    </div>
  );
}

interface ClueDistributionChartProps {
  distribution: Record<number, number>;
  totalWins: number;
}

function ClueDistributionChart({ distribution, totalWins }: ClueDistributionChartProps) {
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((clueNum) => {
        const count = distribution[clueNum] || 0;
        const percentage = totalWins > 0 ? (count / totalWins) * 100 : 0;
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={clueNum} className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 w-4">{clueNum}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%` }}
              />
              {count > 0 && (
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-gray-700">
                  {count}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 w-12 text-right">
              {percentage > 0 ? `${Math.round(percentage)}%` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
