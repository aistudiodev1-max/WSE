import { initialProgress } from '../../data';
import { Progress } from '../../types';

let localProgress = [...initialProgress];

export const progressApi = {
  getProgress: async (): Promise<Progress[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(localProgress), 500);
    });
  },
  saveProgress: async (progress: Progress): Promise<Progress> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localProgress = [...localProgress, progress];
        resolve(progress);
      }, 500);
    });
  },
};
