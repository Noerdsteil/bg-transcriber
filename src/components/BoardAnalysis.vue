<template>
  <div class="relative">
    <canvas
      ref="analysisCanvas"
      class="absolute inset-0 pointer-events-none"
      :width="width"
      :height="height"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { BackgammonBoardAnalyzer } from "../utils/boardRecognition";

const props = defineProps({
  frame: {
    type: HTMLCanvasElement,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["boardStateDetected"]);
const analysisCanvas = ref(null);
const analyzer = ref(null);

onMounted(async () => {
  analyzer.value = new BackgammonBoardAnalyzer();
  await analyzer.value.initialize();

  // Initial calibration
  if (props.frame) {
    const calibrated = analyzer.value.calibrateBoard(props.frame);
    if (calibrated) {
      analyzeCurrentFrame();
    }
  }
});

watch(
  () => props.frame,
  () => {
    if (analyzer.value?.calibrated) {
      analyzeCurrentFrame();
    }
  }
);

const analyzeCurrentFrame = () => {
  const result = analyzer.value.analyzeFrame(props.frame);
  drawAnalysis(result);
  emit("boardStateDetected", result);
};

const drawAnalysis = (result) => {
  const ctx = analysisCanvas.value.getContext("2d");
  ctx.clearRect(0, 0, props.width, props.height);

  // Draw checker positions
  result.checkers.forEach((checker) => {
    ctx.beginPath();
    ctx.strokeStyle = checker.color === "white" ? "green" : "red";
    ctx.lineWidth = 2;
    ctx.arc(checker.position.x, checker.position.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Draw dice
  result.dice.forEach((die) => {
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    ctx.fillRect(die.position.x - 15, die.position.y - 15, 30, 30);
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(die.value.toString(), die.position.x - 4, die.position.y + 4);
  });
};
</script>
