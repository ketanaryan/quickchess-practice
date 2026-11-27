import React from 'react';
import { Volume2, VolumeX, Menu, Palette, Award, RotateCcw } from 'lucide-react';
import { BOARD_THEMES, BoardTheme } from '../constants/boardThemes';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentTheme: BoardTheme;
  onSelectTheme: (theme: BoardTheme) => void;
  totalStars: number;
  completedChaptersCount: number;
  totalChaptersCount: number;
  onResetAllProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  soundEnabled,
  onToggleSound,
  currentTheme,
  onSelectTheme,
  totalStars,
  completedChaptersCount,
  totalChaptersCount,
  onResetAllProgress,
}) => {
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

  return (
    <header className="h-14 sm:h-16 border-b border-lichess-border bg-lichess-surface px-2 sm:px-4 md:px-6 flex items-center justify-between select-none z-30 sticky top-0 shadow-md">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-lichess-surfaceHover text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
          title="Toggle Practice Chapters"
        >
          <Menu className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-gray-400">Chapters</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-900/30 shrink-0">
            <span className="text-lg sm:text-xl font-black text-white leading-none">♚</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-gray-100 tracking-tight truncate">
                Quick Chess
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden md:inline-block shrink-0">
                Checkmate Practice
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 hidden sm:block truncate">
              Interactive Endgame Mastery Module
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Progress summary badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-lichess-dark border border-lichess-border/80 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-semibold" title="Total Stars Earned">
            <Award className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs">{totalStars}</span>
          </div>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-gray-300 font-medium hidden sm:inline" title="Completed Chapters">
            {completedChaptersCount}/{totalChaptersCount} Done
          </span>
        </div>

        {/* Board Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-lichess-surfaceHover text-gray-300 hover:text-white transition-colors"
            title="Change Board Theme"
          >
            <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-lichess-surface border border-lichess-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Board Theme
              </div>
              {BOARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-lichess-surfaceHover transition-colors ${
                    currentTheme.id === theme.id ? 'text-emerald-400 font-semibold bg-emerald-950/40' : 'text-gray-200'
                  }`}
                >
                  <span>{theme.name}</span>
                  <div className="flex border border-gray-600 rounded overflow-hidden w-6 h-4">
                    <div className="w-1/2 h-full" style={{ backgroundColor: theme.lightSquare }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: theme.darkSquare }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-lichess-surfaceHover text-gray-300 hover:text-white transition-colors"
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
        </button>

        {/* Reset progress */}
        <button
          onClick={() => {
            if (window.confirm('Reset all completed chapter stars and progress?')) {
              onResetAllProgress();
            }
          }}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-lichess-surfaceHover text-gray-400 hover:text-red-400 transition-colors hidden sm:block"
          title="Reset Practice Records"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
