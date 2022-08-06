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
      this.socket = new WebSocket(
        `${import.meta.env.VITE_WSS}?userId=${user.id}`
      );
      this.socket.onopen = () => {
        const guild = JSON.stringify({ guild: guildId });
        this.socket?.send(guild);
        this.missedHeartbeats = 0;
        this.interval = setInterval(() => this.ping(), 5000);
        // set interval to ping server every 5 seconds.  count 3 misses before closing connection and clearing queue / disabling player
        // (modal: "discord bot may be down, try refreshing player").  if cant open connection, home page should display "can't connect, bot is probably down. try again later"
      };
      this.socket.onclose = () => {
        clearInterval(this.interval);
        this.socket = undefined;
        console.log('socket CLOSED', this.socket);
      };

      const queue = useQueueStore();
      this.socket.onmessage = e => {
        const response = this.serverResponse(e.data);
        if (response === 'pong') {
          this.missedHeartbeats = 0;
          return;
        }
        for (const key in response) {
          if (key === 'userId') continue;
          switch (key) {
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
              console.log('playTime from server: ', response.playTime);
              if (response.userId !== user.id) {
                // don't update client who made the original request
                queue.setPlayTime(response.playTime, false);
              }
              break;
            case 'sync':
              console.log('received sync from server', response.sync);
              queue.setPlayTime(response.playTime, true);
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
      }
    }
  }
});
