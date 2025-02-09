import { defineStore } from "pinia";
import type { VideoState, Flag, VideoFile, FlagType } from "../types";
import { analyzeDice } from "../utils/diceAnalysis";
// src/stores/videoStore.ts
export const useVideoStore = defineStore("video", {
  state: (): VideoState => ({
    flags: [],
    currentVideoSrc: null,
    videoDuration: 0,
    currentTime: 0,
    videoFile: null,
  }),

  actions: {
    addFlag(timestamp: number, thumbnail: string, type: FlagType): void {
      const newFlag: Flag = {
        timestamp,
        thumbnail,
        type,
        analysis: {
          dice: type === "DICE_ROLL" ? null : null, // Will be analyzed immediately for DICE_ROLL
          confirmed: false,
        },
        id: Date.now(),
      };

      const index = this.flags.findIndex((flag) => flag.timestamp > timestamp);
      if (index === -1) {
        this.flags.push(newFlag);
      } else {
        this.flags.splice(index, 0, newFlag);
      }

      if (type === "DICE_ROLL") {
        // Trigger immediate dice analysis
        this.analyzeDiceRoll(newFlag);
      }

      this.saveToLocalStorage();
    },

    async analyzeDiceRoll(flag: Flag): Promise<void> {
      // Create an image from the thumbnail
      const img = new Image();
      img.src = flag.thumbnail;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Analyze dice
      const dice = await analyzeDice(imageData);
      this.updateFlagAnalysis(flag.id, { dice, confirmed: false });
    },

    updateFlagAnalysis(
      flagId: number,
      analysis: Partial<Flag["analysis"]>
    ): void {
      const flag = this.flags.find((f) => f.id === flagId);
      if (flag) {
        flag.analysis = { ...flag.analysis, ...analysis };
        this.saveToLocalStorage();
      }
    },

    setVideoFile(file: VideoFile | null): void {
      this.videoFile = file;
      this.currentVideoSrc = file ? URL.createObjectURL(file) : null;
      this.saveToLocalStorage();
    },

    saveToLocalStorage(): void {
      const dataToSave = {
        flags: this.flags,
        videoFile: this.videoFile,
      };
      localStorage.setItem("backgammonAnalysis", JSON.stringify(dataToSave));
    },

    loadFromLocalStorage(): void {
      const savedData = localStorage.getItem("backgammonAnalysis");
      if (savedData) {
        const data = JSON.parse(savedData);
        this.flags = data.flags || [];
        if (data.videoFile) {
          const file = new File([data.videoFile], data.videoFile.name, {
            type: data.videoFile.type,
          }) as VideoFile;
          this.setVideoFile(file);
        }
      }
    },
  },
});
