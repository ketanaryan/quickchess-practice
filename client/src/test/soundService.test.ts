import { describe, it, expect } from 'vitest';
import { soundService } from '../services/soundService';

describe('SoundService', () => {
  it('toggles audio enabled state correctly', () => {
    soundService.setEnabled(true);
    expect(soundService.isEnabled()).toBe(true);

    soundService.setEnabled(false);
    expect(soundService.isEnabled()).toBe(false);

    soundService.setEnabled(true);
    expect(soundService.isEnabled()).toBe(true);
  });

  it('safely handles audio triggers when running in test / headless DOM environment without crashing', () => {
    expect(() => {
      soundService.playMove();
      soundService.playCapture();
      soundService.playCheck();
      soundService.playVictory();
      soundService.playIllegal();
    }).not.toThrow();
  });
});
