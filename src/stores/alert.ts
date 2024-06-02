import { defineStore } from 'pinia';

type Button = {
  title: string;
  fn: Function;
};

export const useAlertStore = defineStore({
  id: 'alert',
  state: () => ({
    message: '',
    display: false,
    type: 'error',
    btn1: null as Button | null,
    btn2: null as Button | null
  }),
  actions: {
    setMessage(msg: string, type: string, time: number | null) {
      this.message = msg;
      this.type = type;
      this.display = true;
      if (time) {
        setTimeout(() => {
          this.display = false;
        }, time);
      }
    },
    setButtons(btn1: Button, btn2?: Button) {
      this.btn1 = btn1;
      if (btn2) {
        this.btn2 = btn2;
      }
    },
    forceClose() {
      this.display = false;
    }
  }
});
