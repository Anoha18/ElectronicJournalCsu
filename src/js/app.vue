
<script>
import {mapState, mapMutations, mapActions} from 'vuex';
import Navbar from './components/Navbar.vue';
import { onopen, clearPing } from '../wss';

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      
    }
  },
  computed: {
    ...mapState([
      'page',
      'user',
      'webSocket',
    ]),
  },

  created() {
    this.initSocket();
  },

  methods: {
    ...mapActions([
      'joinWebSocket',
    ]),

    ...mapMutations([
      'setWebSocket',
      'setMessage',
    ]),

    initSocket() {
      this.setWebSocket(null);
      const vm = this;
      // const connection = new WebSocket('wss://xn--d1aamiqfj1dwd.xn--p1ai/socket/connect');
      const connection = new WebSocket('ws://'+ location.hostname +':3000/socket/connect');
      this.setWebSocket(connection);
      onopen(this.webSocket);

      setTimeout(() => {
        this.joinWebSocket();
      }, 1000);

      this.webSocket.onmessage = (res) => {
        let data = JSON.parse(res.data);
        if (data.type == 'message') this.setMessage(data.message);
      };

      this.webSocket.onclose = () => {
        clearPing();
        console.log('WebSocket: Reconnection...');

        setTimeout(() => {
          vm.initSocket();
        }, 5000);
      };
    },
  },
}
</script>
  
<template>
  <body>
    <navbar v-if="page.navbar"></navbar>
    <router-view v-if="!page.reload"></router-view>
  </body>
</template>