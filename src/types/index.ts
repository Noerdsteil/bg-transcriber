// src/types/index.ts
export type FlagType = "DICE_ROLL" | "MOVE_COMPLETE";

export interface Flag {
  id: number;
  timestamp: number;
  thumbnail: string;
  type: FlagType;
  analysis: {
    dice: [number, number] | null;
    confirmed: boolean;
  };
}
export interface VideoFile extends File {
  lastModifiedDate?: Date;
}

export interface VideoState {
  flags: Flag[];
  currentVideoSrc: string | null;
  videoDuration: number;
  currentTime: number;
  videoFile: VideoFile | null;
}
