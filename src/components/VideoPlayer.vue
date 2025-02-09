<template>
  <div class="w-full">
    <div class="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref="videoRef"
        class="w-full h-full"
        @loadedmetadata="handleVideoLoaded"
        @timeupdate="handleTimeUpdate"
        controls
      >
        <source :src="videoSrc" type="video/mp4" />
      </video>

      <!-- Control Buttons -->
      <div class="absolute bottom-16 right-4 flex space-x-2">
        <button
          @click="flagDiceRoll"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2"
        >
          <dice-icon class="w-4 h-4" />
          <span>Flag Dice</span>
        </button>

        <button
          @click="flagMoveComplete"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2"
        >
          <flag-icon class="w-4 h-4" />
          <span>Flag Move</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Timeline with Flags
    <div class="mt-4 relative h-12 bg-gray-100 rounded">
      <div class="absolute inset-0 flex items-center">
        <div
          class="h-2 bg-blue-500"
          :style="{ width: `${(currentTime / duration) * 100}%` }"
        ></div>

        <div
          v-for="flag in flags"
          :key="flag.id"
          class="absolute w-2 h-8 bg-red-500 cursor-pointer hover:bg-red-600"
          :style="{ left: `${(flag.timestamp / duration) * 100}%` }"
          @click="jumpToFlag(flag)"
        ></div>
      </div>
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { defineProps } from "vue";
import { Flag as FlagIcon, CheckCircle as DiceIcon } from "lucide-vue-next";
import { useVideoStore } from "../stores/videoStore";
import type { Flag } from "../types";

interface Props {
  videoSrc: string;
}

const props = defineProps<Props>();
const videoStore = useVideoStore();
const videoRef = ref<HTMLVideoElement | null>(null);
const currentTime = ref(0);
const duration = ref(0);

const handleVideoLoaded = (): void => {
  if (!videoRef.value) return;
  duration.value = videoRef.value.duration;
  videoStore.setVideoDetails(props.videoSrc, videoRef.value.duration);
};

const handleTimeUpdate = (): void => {
  if (!videoRef.value) return;
  currentTime.value = videoRef.value.currentTime;
  videoStore.setCurrentTime(currentTime.value);
};

// const flagCurrentPosition = async (): Promise<void> => {
//   if (!videoRef.value) return;
//   const video = videoRef.value;
//   video.pause();

//   const canvas = document.createElement("canvas");
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   const ctx = canvas.getContext("2d");
//   if (!ctx) return;

//   ctx.drawImage(video, 0, 0);
//   const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

//   videoStore.addFlag(video.currentTime, thumbnail);
// };

const flagDiceRoll = async () => {
  if (!videoRef.value) return;
  const video = videoRef.value;
  video.pause();

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0);
  const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

  videoStore.addFlag(video.currentTime, thumbnail, "DICE_ROLL");
};

const flagMoveComplete = async () => {
  if (!videoRef.value) return;
  const video = videoRef.value;
  video.pause();

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0);
  const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

  videoStore.addFlag(video.currentTime, thumbnail, "MOVE_COMPLETE");
};

const jumpToFlag = (flag: Flag): void => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = flag.timestamp;
};
</script>
