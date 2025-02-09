<template>
  <div class="container mx-auto p-4">
    <FileUpload v-if="!videoStore.videoFile" />

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Video Player Column -->
      <div class="lg:col-span-2">
        <VideoPlayer :video-src="videoStore.currentVideoSrc" />
      </div>

      <!-- Flags Column -->
      <div>
        <FlagList
          @select-flag="handleFlagSelect"
          @remove-flag="handleFlagRemove"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useVideoStore } from "./stores/videoStore";
import FileUpload from "./components/FileUpload.vue";
import VideoPlayer from "./components/VideoPlayer.vue";
import FlagList from "./components/FlagList.vue";
import type { Flag } from "./types";

const videoStore = useVideoStore();

const handleFlagSelect = (flag: Flag): void => {
  // Handle flag selection
};

const handleFlagRemove = (flagId: number): void => {
  videoStore.removeFlag(flagId);
};

onMounted(() => {
  videoStore.loadFromLocalStorage();
});
</script>
