<template>
  <div class="w-full max-w-md bg-white rounded-lg shadow">
    <div class="p-4 border-b">
      <h2 class="text-lg font-semibold">Game Analysis</h2>
    </div>

    <div class="divide-y">
      <div
        v-for="flag in flags"
        :key="flag.id"
        class="p-4 hover:bg-gray-50 cursor-pointer"
        :class="{
          'bg-blue-50': flag.type === 'DICE_ROLL',
          'bg-green-50': flag.type === 'MOVE_COMPLETE',
        }"
      >
        <div class="flex items-center space-x-4">
          <!-- Thumbnail -->
          <img
            :src="flag.thumbnail"
            class="w-24 h-16 object-cover rounded"
            alt="Turn thumbnail"
          />

          <div class="flex-1">
            <div class="font-medium flex items-center space-x-2">
              <dice-icon v-if="flag.type === 'DICE_ROLL'" class="w-4 h-4" />
              <flag-icon v-else class="w-4 h-4" />
              <span>{{
                flag.type === "DICE_ROLL" ? "Dice Roll" : "Move Complete"
              }}</span>
            </div>
            <div class="text-sm text-gray-500">
              {{ formatTime(flag.timestamp) }}
            </div>

            <!-- Analysis Results -->
            <div v-if="flag.analysis?.dice" class="mt-2">
              <div class="flex items-center space-x-2">
                <div
                  v-for="(die, index) in flag.analysis.dice"
                  :key="index"
                  class="w-8 h-8 bg-white border rounded flex items-center justify-center font-bold"
                >
                  {{ die }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Check as CheckIcon, RefreshCw as RefreshIcon } from "lucide-vue-next";
import { Search as SearchIcon, Trash as TrashIcon } from "lucide-vue-next";
import { useVideoStore } from "../stores/videoStore";
import { analyzeDice } from "../utils/diceAnalysis";

const videoStore = useVideoStore();
const flags = videoStore.flags;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const analyzeFlag = async (flag) => {
  // Get frame data from thumbnail
  const img = new Image();
  img.src = flag.thumbnail;
  await new Promise((resolve) => (img.onload = resolve));

  // Create canvas to get image data
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Analyze dice
  const dice = await analyzeDice(imageData);
  videoStore.updateFlagAnalysis(flag.id, { dice, confirmed: false });
};

const confirmAnalysis = (flag) => {
  videoStore.updateFlagAnalysis(flag.id, { confirmed: true });
};

const reanalyzeFlag = (flag) => {
  analyzeFlag(flag);
};
</script>
