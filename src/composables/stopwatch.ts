import { ref } from 'vue';
import type { Ref } from 'vue';

export function useStopwatch() {
  const time: Ref<string> = ref('');
  const timeInMS: Ref<number> = ref(0);

  let timeBegan: Date | null = null,
    timeStopped: Date | null = null,
    stoppedDuration = 0,
    started: ReturnType<typeof setInterval>,
    running = false;

  function startTimer() {
    if (running) return;

    if (timeBegan === null) {
      resetTimer();
      timeBegan = new Date();
    }

    if (timeStopped !== null) {
      stoppedDuration += new Date().getTime() - timeStopped.getTime();
    }

    started = setInterval(clockRunning, 10);
    running = true;
  }

  function stopTimer() {
    running = false;
    timeStopped = new Date();
    clearInterval(started);
  }

  function resetTimer() {
    running = false;
    clearInterval(started);
    stoppedDuration = 0;
    timeBegan = null;
    timeStopped = null;
    time.value = '0:00';
  }

  // time in ms
  function setTime(time: number) {
    timeBegan = new Date();
    stoppedDuration = 0;
    timeStopped = null;
    timeBegan = new Date(Date.now() - time);
    clockRunning();
  }

  function clockRunning() {
    const currentTime = new Date();
    timeInMS.value =
      currentTime.getTime() - timeBegan!.getTime() - stoppedDuration;
    const timeElapsed = new Date(timeInMS.value),
      hour = timeElapsed.getUTCHours(),
      min = timeElapsed.getUTCMinutes(),
      sec = timeElapsed.getUTCSeconds();

    time.value = formatTime(hour, min, sec);
  }

  function formatTime(hour: number, min: number, sec: number) {
    return [
      hour > 0 ? hour : '',
      hour > 0 && min <= 9 ? '0' + min : min || '0',
      sec > 9 ? sec : '0' + sec
    ]
      .filter(Boolean)
      .join(':');
  }
  return {
    startTimer,
    stopTimer,
    resetTimer,
    setTime,
    time,
    timeInMS,
    formatTime
  };
}
