<template>
  <div id="history">
    <div class="text-5xl mt-5">History</div>
    <div class="text-sm my-2 italic">Most recent 100 actions of the bot</div>
    <div
      class="flex text-lg btn w-fit bg-blue-500 hover:bg-blue-400 mb-4 mt-6"
      @click="getHistory"
    >
      <span class="mr-2 text-white">Refresh</span>
      <RefreshCircle :size="30" class="text-white cursor-pointer" />
    </div>
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th></th>
            <th>User</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(history, index) in histories" :key="history._id">
            <th>{{ index + 1 }}</th>
            <td v-if="history.user">{{ history.user.global_name }}</td>
            <td v-else class="text-yellow-500 font-bold">YoduhBoat</td>
            <td v-if="Array.isArray(history.action)">
              <template v-for="(action, idx) in history.action" :key="idx">
                <span v-if="idx === 0 || idx === 2">{{ action }}</span>
                <a
                  v-else
                  :href="history.song.link"
                  target="_blank"
                  class="link font-bold"
                  >{{ action }}</a
                >
              </template>
            </td>
            <td v-else>{{ history.action }}</td>
            <td>{{ formatDate(history.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/plugins/api';
import { useUserStore } from '@/stores/user';
import RefreshCircle from 'vue-material-design-icons/RefreshCircle.vue';

const user = useUserStore();
const histories = ref<ActionHistory[]>([]);

function getHistory() {
  api
    .get('/history', {
      params: {
        guildId: user.selectedGuild
      }
    })
    .then(res => {
      histories.value = res.data.map((h: ActionHistory) => {
        if (h.song || h.action.includes('%TITLE%')) {
          h.action = formatAction(h);
        }
        return h;
      });
    });
}
getHistory();

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleString();
}

// splits action into three parts so middle part (song information) can be transformed into a link
function formatAction(history: ActionHistory) {
  let { action, song } = history;
  if (action.includes('%SONG%') && !Array.isArray(action)) {
    const splitAction = action.split('%SONG%');
    const songTitle = `${song.artist ? song.artist + ' - ' : ''}${song.title}`;
    return [splitAction[0], songTitle, splitAction[1]];
  } else if (action.includes('%TITLE%') && !Array.isArray(action)) {
    const splitAction = action.split('%TITLE%');
    const link = splitAction[2].split('%LINK%')[1];
    splitAction[2] = '';
    history.song = { link: link };
    return splitAction;
  }
  return [action];
}
</script>

<style scoped></style>
