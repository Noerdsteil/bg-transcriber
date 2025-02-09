<template>
  <div class="w-full">
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept="video/*"
        @change="handleFileSelect"
      />

      <div v-if="!videoStore.videoFile" class="space-y-4">
        <upload-icon class="w-12 h-12 mx-auto text-gray-400" />
        <div class="text-gray-600">
          Drag and drop your video file here or
          <button
            @click="$refs.fileInput.click()"
            class="text-blue-500 hover:text-blue-600"
          >
            browse
          </button>
        </div>
      </div>

      <div v-else class="space-y-2">
        <check-circle-icon class="w-8 h-8 mx-auto text-green-500" />
        <div class="font-medium">{{ videoStore.videoFile.name }}</div>
        <button
          @click="clearVideo"
          class="text-red-500 hover:text-red-600 text-sm"
        >
          Remove video
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
} from "lucide-vue-next";
import { useVideoStore } from "../stores/videoStore";
import type { VideoFile } from "../types";

const videoStore = useVideoStore();
const fileInput = ref<HTMLInputElement | null>(null);

const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] as VideoFile;
  if (file) {
    videoStore.setVideoFile(file);
  }
};

const handleDrop = (event: DragEvent): void => {
  const file = event.dataTransfer?.files[0] as VideoFile;
  if (file?.type.startsWith("video/")) {
    videoStore.setVideoFile(file);
  }
};

const clearVideo = (): void => {
  videoStore.setVideoFile(null);
};
</script>
