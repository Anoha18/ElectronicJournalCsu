<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'modal-new-message',
  props: ['objectUser'],
  data() {
    return {
      visible: false,
      text: null,
      sending: false,
    };
  },

  computed: {
    ...mapState([
      'user',
    ]),
  },

  created() {

  },

  methods: {
    ...mapActions([
      'addMessage',
    ]),

    async sendMessage() {
      this.sending = true;

      if (this.text == null) return;

      if (this.text == '') return;

      const data = {
        ownerId: this.user.user_id,
        objectId: this.objectUser.user_id,
        text: this.text,
      };

      await this.addMessage(data);

      this.sending = false;
      this.visible = false;
    }
  },
}
</script>

<template>
  <div>
    <a-button type="primary" @click="visible = true">Новое сообщение</a-button>
    <a-modal centered title="Новое сообщение" v-model="visible">
      <div class="body-new-message">
        <a-textarea v-model="text" placeholder="Напишите сообщение" :rows="7" />
      </div>
      <template slot="footer">
        <a-button type="primary" @click="sendMessage" :disabled="sending">Отправить</a-button>
      </template>
    </a-modal>
  </div>
</template>

<style lang="scss">
  .body-new-message {
    textarea {
      height: 300px;
      resize: none;
    }
  }
</style>