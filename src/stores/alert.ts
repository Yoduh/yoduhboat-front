import { defineStore } from 'pinia';

export const useAlertStore = defineStore({
  id: 'alert',
  state: () => ({
    message: '',
    display: false
  }),
  actions: {
    setMessage(msg: string, time = 5000) {
      this.message = msg;
      this.display = true;
      setTimeout(() => {
        this.display = false;
      }, time);
    }
  }
});
