// Update CameraView.vue to include board analysis
<template>
  <div class="relative">
    <video
      ref="videoRef"
      class="w-full rounded-lg"
      :class="{ 'opacity-50': !isRecording }"
      autoplay
      muted
    ></video>
    <canvas ref="canvasRef" class="hidden"></canvas>
    <BoardAnalysis
      v-if="isRecording"
      :frame="canvasRef"
      :width="videoWidth"
      :height="videoHeight"
      @board-state-detected="handleBoardStateDetected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import BoardAnalysis from "./BoardAnalysis.vue";
// ... rest of the existing CameraView.vue code ...

const videoWidth = ref(1280);
const videoHeight = ref(720);

const handleBoardStateDetected = (boardState) => {
  // Update game state with detected board state
  console.log("Detected board state:", boardState);
};
</script>
