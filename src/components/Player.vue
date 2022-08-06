<template>
  <footer
    v-if="user.id"
    class="footer p-5 flex justify-between items-center"
    style="height: 150px; min-height: 150px"
  >
    <div
      v-if="queue.songs.length > 0"
      class="song-info flex items-stretch w-auto"
    >
      <div class="thumbnail">
        <img :src="playingSong.thumbnail" width="200" height="200" />
      </div>
      <div class="flex flex-col justify-around w-full">
        <!-- need to reverse artist/title order here... -->
        <div class="font-bold text-lg song">{{ playingSong.title }}</div>
        <div
          v-if="playingSong.artist"
          class="font-bold text-base song text-gray-400"
        >
          {{ playingSong.artist }}
        </div>
        <div class="flex items-center">
          <div class="avatar">
            <div class="w-5 rounded-full">
              <img :src="playingSong.avatar" />
            </div>
          </div>
          <div class="ml-2 text-green-500">
            {{ playingSong.addedBy }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-lg">No Music Playing</div>
    <div
      class="controls w-full flex flex-col items-center justify-center h-full"
    >
      <div class="button-row flex pb-2">
        <button
          class="mx-2 control-btn"
          :disabled="isDisabled"
          @click="shuffle"
        >
          <ShuffleVariant :size="30" />
        </button>
        <button class="mx-2 control-btn" :disabled="isDisabled" @click="rewind">
          <SkipPrevious :size="40" />
        </button>
        <button
          v-if="!queue.isPlaying || queue.isPaused"
          class="mx-2 play-btn"
          :disabled="isDisabled"
          @click="play"
        >
          <PlayCircle :size="50" />
        </button>
        <button
          v-else
          class="mx-2 play-btn"
          :disabled="isDisabled"
          @click="pause"
        >
          <PauseCircle :size="50" />
        </button>
        <button
          class="mx-2 control-btn"
          :disabled="isDisabled"
          @click="skipNext"
        >
          <SkipNext :size="40" />
        </button>
        <button class="mx-2 control-btn" :disabled="isDisabled" @click="repeat">
          <Repeat :size="30" />
        </button>
      </div>
      <div
        v-if="queue.songs.length > 0"
        class="playback-info flex items-center w-full h-full"
      >
        <div class="mr-3">{{ time }}</div>
        <Slider
          v-if="!isDisabled"
          v-model="slider"
          :min="0"
          :max="playingSong.duration * 1000"
          :tooltips="false"
          :disabled="isDisabled"
          :options="sliderOptions"
          class="playback-slider w-full"
          @start="startDrag"
          @end="endDrag"
          @set="setSlider($event, true)"
          @slide="slideSlider"
        />
        <div class="ml-3">{{ playingSong?.durationTime }}</div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import ShuffleVariant from 'vue-material-design-icons/ShuffleVariant.vue';
import SkipPrevious from 'vue-material-design-icons/SkipPrevious.vue';
import PlayCircle from 'vue-material-design-icons/PlayCircle.vue';
import PauseCircle from 'vue-material-design-icons/PauseCircle.vue';
import SkipNext from 'vue-material-design-icons/SkipNext.vue';
import Repeat from 'vue-material-design-icons/Repeat.vue';
import { computed, ref, watch } from 'vue';
import { useQueueStore } from '@/stores/queue.js';
import { useUserStore } from '@/stores/user.js';
import Slider from '@vueform/slider';
import { useStopwatch } from '@/composables/stopwatch.js';
import throttle from 'just-throttle';

const user = useUserStore();
const queue = useQueueStore();
const playingSong = computed(() => {
  return queue.songs[0];
});

const isDisabled = computed(() => {
  return queue?.songs?.length === 0;
});
watch(
  () => queue.isPaused,
  isPaused => {
    if (isPaused) {
      clearInterval(handle);
      stopTimer();
    } else {
      startTimer();
      clearInterval(handle);
      handle = setInterval(updateSlider, 100);
    }
  }
);
watch(
  () => queue.playTime,
  playTime => {
    console.log('playTime updated, setting slider');
    setSlider(playTime, false);
  }
);

// SLIDER STUFF
const {
  time,
  timeInMS,
  stopTimer,
  startTimer,
  setTime,
  resetTimer,
  formatTime
} = useStopwatch();
const slider = ref(0);
let handle: ReturnType<typeof setInterval>;
const sliderOptions = {
  connect: 'lower'
};
const updateSlider = () => {
  slider.value = timeInMS.value;
  console.log('update...', handle);
};
const throttledSeek = throttle(newTime => queue.seek(newTime), 100, {
  leading: true
});
const setSlider = (newTime: number, andSeek: boolean) => {
  if (andSeek) {
    throttledSeek(newTime);
  }
  setTime(newTime);
  updateSlider();
  if (!queue.isPaused) {
    startTimer();
    clearInterval(handle);
    handle = setInterval(updateSlider, 100);
  }
};
const startDrag = () => {
  console.log('START DRAG: stop updating handle', handle);
  clearInterval(handle);
  stopTimer();
};
const endDrag = () => {
  console.log('END DRAG (also calls SET)');
};
const slideSlider = (clickedTime: number) => {
  console.log('SLIDING');
  msToTime(clickedTime);
};

const shuffle = () => {
  console.log('shuffle');
};

const rewind = () => {
  console.log('rewind');
};

const play = () => {
  queue.togglePause();
};

const pause = () => {
  queue.togglePause();
};

const skipNext = () => {
  console.log('skipNext');
};

const repeat = () => {
  console.log('repeat');
};

const msToTime = (msTime: number) => {
  const timeElapsed = new Date(msTime),
    hour = timeElapsed.getUTCHours(),
    min = timeElapsed.getUTCMinutes(),
    sec = timeElapsed.getUTCSeconds();

  time.value = formatTime(hour, min, sec);
};

watch(playingSong, (newSong, oldSong) => {
  // disable the player if no more songs in the queue
  if (!newSong && oldSong) {
    resetTimer();
    clearInterval(handle);
    return;
  }
  // reset playback bar when new song starts (reset handle position, reset timer, start handle and timer IF not paused)
  if (newSong._id !== oldSong?._id) {
    console.log('new song!');
    // new song is only reported once player is playing (skipping while paused needs to be looked at)
    setSlider(0, false);
  }
});

if (queue.isPlaying) {
  setSlider(queue.playTime, false);
}
</script>

<style src="@vueform/slider/themes/default.css" />
<style lang="scss" scoped>
.footer {
  background: rgb(19, 85, 29);
  background: linear-gradient(
    0deg,
    rgba(19, 85, 29, 1) 0%,
    rgba(31, 45, 31, 1) 100%
  );
}
.playback-slider {
  cursor: pointer;
}
.playback-slider :deep(.slider-handle) {
  display: none;
}
.playback-slider:hover :deep(.slider-handle) {
  display: block;
}
.playback-slider :deep(.slider-connect) {
  background: white !important;
}
.playback-slider:hover :deep(.slider-connect) {
  background: rgb(29, 185, 84) !important;
}
.playback-slider :deep(.slider-base) {
  z-index: 100 !important;
}
.control-btn {
  color: rgb(186, 186, 186);
  &:hover {
    color: white;
  }
  &:disabled {
    color: rgb(186, 186, 186, 0.2);
  }
}
.play-btn {
  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(1);
  }
  &:disabled {
    color: rgb(186, 186, 186, 0.2);
  }
}
</style>
