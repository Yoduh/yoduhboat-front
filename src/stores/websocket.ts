import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { useQueueStore } from '@/stores/queue';

export const useWebsocketStore = defineStore({
  id: 'websocket',
  state: () => ({
    socket: undefined as WebSocket | undefined,
    interval: undefined as ReturnType<typeof setInterval> | undefined,
    missedHeartbeats: 0
  }),
  actions: {
    openWebsocket(guildId: string) {
      const user = useUserStore();
      const queue = useQueueStore();
      console.log(
        'opening websocket with id',
        user.id ? user.id : localStorage.id
      );
      if (this.socket) this.socket.close();
      this.socket = new WebSocket(
        `${import.meta.env.VITE_WSS}?userId=${
          user.id ? user.id : localStorage.id
        }`
      );
      this.socket.onopen = () => {
        const guild = JSON.stringify({ guild: guildId });
        console.log('sending socket guild', guild);
        this.socket?.send(guild);
        this.missedHeartbeats = 0;
        this.interval = setInterval(() => this.ping(), 5000);
        // set interval to ping server every 5 seconds.  count 3 misses before closing connection and clearing queue / disabling player
        // (modal: "discord bot may be down, try refreshing player").  if cant open connection, home page should display "can't connect, bot is probably down. try again later"
      };

      this.socket.onmessage = e => {
        const response = this.serverResponse(e.data);
        if (response === 'pong') {
          this.missedHeartbeats = 0;
          return;
        }
        for (const key in response) {
          if (key === 'userId') continue;
          switch (key) {
            case 'botVoiceChannel':
              console.log('botVoiceId', response.botVoiceChannel);
              user.botChannel = response.botVoiceChannel;
              break;
            case 'userVoiceId':
              user.voiceChannel = response.userVoiceId;
              break;
            case 'stopped':
              queue.$reset();
              break;
            case 'isPlaying':
              queue.isPlaying = response.isPlaying;
              break;
            case 'isPaused':
              console.log('setting pause status', response.isPaused);
              queue.isPaused = response.isPaused;
              break;
            case 'queue':
              console.log('setting new queue', response.queue);
              queue.setQueue(response.queue);
              break;
            case 'doneSong':
              console.log('current song is DONE');
              queue.doneSong(response.doneSong);
              break;
            case 'playTime':
              console.log('received playTime from server', response.playTime);
              if (queue.isPaused) {
                console.log('IGNORING WHILE PAUSED');
                break;
              }
              queue.setPlayTime(response.playTime, true);
              break;
            case 'initialTime':
              console.log('initialTime from server', response.initialTime);
              queue.setPlayTime(response.initialTime, true);
              break;
            default:
              console.log(
                'unhandled websocket response from server:',
                response
              );
              break;
          }
        }
      };
    },
    serverResponse(str: string) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return str;
      }
    },
    ping() {
      this.socket?.send('ping');
      this.missedHeartbeats++;
      if (this.missedHeartbeats > 3) {
        console.log('missed > 3 heartbeats. closing socket!');
        this.socket?.close();
        clearInterval(this.interval);
        this.socket = undefined;
        const queue = useQueueStore();
        queue.$reset();
      }
    }
  }
});
