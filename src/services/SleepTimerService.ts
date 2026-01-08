import { VideoPlayer } from 'expo-video';

// ─────────────────────────────────────────────────────────────────────────────
// Sleep Timer Service
// ─────────────────────────────────────────────────────────────────────────────

let sleepTimerId: NodeJS.Timeout | null = null;
let targetTime: number | null = null;

// Helper log
const log = (msg: string) => console.log(`[SleepTimer] ${msg}`);

/**
 * Start the sleep timer.
 * @param minutes Duration in minutes
 * @param player VideoPlayer instance to pause
 */
export const startTimer = (minutes: number, player: VideoPlayer) => {
  cancelTimer(); // Clear existing if any

  if (minutes <= 0) return;
  
  const ms = minutes * 60 * 1000;
  targetTime = Date.now() + ms;
  
  log(`Timer started for ${minutes} minutes.`);
  
  sleepTimerId = setTimeout(() => {
    log('Timer fired. Pausing player.');
    if (player) {
      player.pause();
    }
    cancelTimer(); // Cleanup
  }, ms);
};

/**
 * Cancel the current sleep timer.
 */
export const cancelTimer = () => {
  if (sleepTimerId) {
    clearTimeout(sleepTimerId);
    sleepTimerId = null;
    targetTime = null;
    log('Timer canceled.');
  }
};

/**
 * Get remaining time in seconds, or null if no timer active.
 */
export const getRemainingTime = (): number | null => {
  if (!targetTime) return null;
  const remaining = Math.max(0, targetTime - Date.now());
  return Math.ceil(remaining / 1000);
};

export default {
  startTimer,
  cancelTimer,
  getRemainingTime,
};
