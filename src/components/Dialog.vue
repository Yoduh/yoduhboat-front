<template>
  <div v-if="dialog">
    <Teleport to="#app">
      <dialog id="my_modal_1" ref="my_modal" class="modal">
        <div ref="modal_box" class="modal-box">
          <h3 class="font-bold text-lg">{{ title }}</h3>
          <p class="py-4">
            <slot />
          </p>
          <div class="modal-action">
            <form method="dialog">
              <!-- if there is a button in form, it will close the modal -->
              <button class="btn mx-5" @click="close">
                {{ closeBtn }}
              </button>
              <button
                class="btn bg-green-800 text-white hover:bg-green-600"
                @click="$emit('ok')"
              >
                {{ okBtn }}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';

const emit = defineEmits(['ok', 'closed']);
defineProps({
  title: {
    type: String,
    required: true
  },
  okBtn: {
    type: String,
    default: 'OK'
  },
  closeBtn: {
    type: String,
    default: 'Cancel'
  }
});

const dialog = defineModel();

const my_modal = ref();
const modal_box = ref();
onClickOutside(modal_box, () => {
  dialog.value = false;
  emit('closed');
});

function close() {
  dialog.value = false;
  emit('closed');
}

watch(dialog, open => {
  if (open) {
    dialog.value = true;
    nextTick(() => {
      my_modal.value.show();
    });
  } else {
    my_modal.value.close();
  }
});
</script>

<style scoped>
dialog {
  background-color: #00000078;
}
</style>
