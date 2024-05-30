<template>
  <footer
    v-if="user.id"
    class="footer p-5 flex justify-start items-center"
    style="height: 150px; min-height: 150px"
  >
    <!-- AND if user.botChannel && user.voiceChannel !== user.botChannel.id    ...new user.state var for 'activeConnection' true/false-->
    <div
      v-if="queue.songs.length > 0 && user.validVoiceState"
      id="songInfo"
      class="song-info flex items-stretch w-1/4 lg:w-1/5"
    >
      <div class="thumbnail hidden xl:block">
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
      id="playback"
      class="controls flex flex-col items-center justify-center h-full w-full lg:w-4/5 xl:w-3/5"
    >
      <div class="button-row flex pb-2">
        <div class="tooltip flex" data-tip="Shuffle">
          <button
            class="mx-2 control-btn self-center"
            :disabled="isDisabled"
            @click="shuffle"
          >
            <ShuffleVariant :size="30" />
          </button>
        </div>
        <!-- <button class="mx-2 control-btn" :disabled="isDisabled" @click="rewind">
          <SkipPrevious :size="40" />
        </button> -->
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
        <div class="tooltip flex" data-tip="Skip">
          <button
            class="mx-2 control-btn"
            :disabled="isDisabled"
            @click="skipNext"
          >
            <SkipNext :size="40" />
          </button>
        </div>
        <!-- <button class="mx-2 control-btn" :disabled="isDisabled" @click="repeat">
          <Repeat :size="30" />
        </button> -->
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
// import SkipPrevious from 'vue-material-design-icons/SkipPrevious.vue';
import PlayCircle from 'vue-material-design-icons/PlayCircle.vue';
import PauseCircle from 'vue-material-design-icons/PauseCircle.vue';
import SkipNext from 'vue-material-design-icons/SkipNext.vue';
// import Repeat from 'vue-material-design-icons/Repeat.vue';
import { computed, ref, watch } from 'vue';
import { useQueueStore } from '@/stores/queue.js';
import { useUserStore } from '@/stores/user.js';
import { useWebsocketStore } from '@/stores/websocket';
import Slider from '@vueform/slider';
import { useStopwatch } from '@/composables/stopwatch.js';
import throttle from 'just-throttle';

const user = useUserStore();
const queue = useQueueStore();
const wss = useWebsocketStore();
const playingSong = computed(() => {
  return queue.songs[0];
});

const isDisabled = computed(() => {
  return queue?.songs?.length === 0;
});
// reset and disable controls if user leaves voice chat
watch(
  () => user.validVoiceState,
  validVoiceState => {
    if (!validVoiceState) {
      queue.$reset();
      resetTimer();
      clearHandle();
    } else {
      wss.socket?.send('rejoin');
    }
  }
);
// toggle pause if server issues a pause command
watch(
  () => queue.isPaused,
  isPaused => {
    if (isPaused) {
      clearHandle();
      stopTimer();
    } else if (queue.isPlaying) {
      startTimer();
      clearHandle();
      handle = setInterval(updateSlider, 100);
    }
  }
);
// playTime updates:
// 1) anytime frontend receives a 'sync' update from server
// 2) when frontend receives new song queue when current queue is empty, playTime = 0 in queue.ts
// 3) when removing first song from queue, playTime = 0 in queue.ts
watch(
  () => queue.playTime,
  playTime => {
    if (user.validVoiceState) {
      // console.log('playTime updated, setting slider', playTime);
      setSlider(playTime, false, queue.isPaused ? new Date() : undefined);
    }
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
let handle: ReturnType<typeof setInterval> | null;
const sliderOptions = {
  connect: 'lower'
};
const updateSlider = () => {
  slider.value = timeInMS.value;
  // console.log('update...', handle);
};
const throttledSeek = throttle(newTime => queue.seek(newTime), 100, {
  leading: true
});
const setSlider = (newTime: number, andSeek: boolean, stopTime?: Date) => {
  // console.log('setSlider called');
  if (andSeek) {
    throttledSeek(newTime);
    updateSlider();
    // pause timer and handle: server needs time to seek. next sync will start timer/handle again in time with music
    clearHandle();
    stopTimer();
    return;
  }
  setTime(newTime, stopTime);
  updateSlider();
  if (!queue.isPaused && queue.songs.length > 0) {
    startTimer();
    if (!handle) handle = setInterval(updateSlider, 100);
    // console.log('setSlider handle', handle);
  }
};
const startDrag = () => {
  clearHandle();
  stopTimer();
};
const endDrag = () => {
  // console.log('END DRAG (also calls SET)');
};
const slideSlider = (clickedTime: number) => {
  msToTime(clickedTime);
};

const shuffle = () => {
  queue.shuffle();
};

// const rewind = () => {
//   console.log('rewind');
// };

const play = () => {
  queue.togglePause(slider.value);
};

const pause = () => {
  queue.togglePause(slider.value);
};

const skipNext = () => {
  queue.removeSong(queue.songs[0], 0);
};

// const repeat = () => {
//   console.log('repeat');
// };

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
    clearHandle();
  }
  // reset playback bar when new song starts (reset handle position, reset timer, start handle and timer IF not paused)
  else if (oldSong && newSong._id !== oldSong._id) {
    // new song is only reported once player is playing
    setSlider(0, false, queue.isPaused ? new Date() : undefined);
  }
  // set initial playback position when joining voice with song in progress
  else if (!oldSong) {
    setSlider(queue.playTime, false, queue.isPaused ? new Date() : undefined);
  }
});

if (queue.isPlaying && user.validVoiceState) {
  // console.log('onCreate setSlider');
  setSlider(queue.playTime, false, queue.isPaused ? new Date() : undefined);
}

const clearHandle = () => {
  if (handle) clearInterval(handle);
  handle = null;
};
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
  &:active {
    transform: scale(1.1);
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
