<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  name: 'chat-page',
  props: {
    id: {
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      text: null,
      sending: false,
    }
  },

  computed: {
    ...mapState([
      'user',
      'chat',
    ]),

    filterMessages() {
      return this.chat.messages.map((message) => {
        setTimeout(async () => {
          let messageBlock = await document.getElementById('messagesBlock');
          if (messageBlock && messageBlock.scrollHeight != null) {
            messageBlock.scrollTop = messageBlock.scrollHeight;
          }
        }, 100);
        return message;
      });
    }
  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    const chat = await this.getChat(+this.id);
    await this.setChat(chat);

    await this.setPageTitle('Сообщения');
    await this.setPageNavbar(true);

    this.loading = false;
  },

  methods: {
    ...mapActions([
      'checkUser',
      'getChat',
      'addMessage',
    ]),

    ...mapMutations([
      'setPageTitle',
      'setPageNavbar',
      'setChat',
    ]),

    async goBack() {
      await this.$router.push({
        name: 'chats',
      });
    },

    async sendMessage() {
      this.sending = true;

      if (this.text == null) return;

      if (this.text == '') return;

      const data = {
        ownerId: this.user.user_id,
        chatId: +this.id,
        text: this.text,
      };

      await this.addMessage(data);

      this.text = null;

      this.sending = false;
    },

    async showUser(userId) {
      await this.$router.push({
        name: 'user_page',
        params: {
          id: userId,
        }
      })
    }
  },
}
</script>

<template>
  <div class="body relative">
    <div class="page-spinner" v-if="loading">
      <a-spin tip="Загрузка...">
      </a-spin>
    </div>
    <div class="container h-100" v-else>
      <div class="row justify-content-center pt-3 pb-3 h-100">
        <div class="col-12 col-sm-10 col-md-7 col-lg-7 h-100">
          <div class="chat-container h-100">
            <div class="chat-header">
              <div @click="goBack" class="chat-header__left chat-link__back">
                <a-icon type="arrow-left" />
              </div>
              <div class="chat-header__title">
                <div class="chat-icon mr-2">
                  <a-avatar
                    v-if="chat.objectuser.avatar_path"
                    slot="avatar"
                    :src="chat.objectuser.avatar_path"
                    :size="30"
                    class="user-link"
                    @click="showUser(chat.objectuser.user_id)"
                  />
                  <a-avatar
                    v-else
                    slot="avatar"
                    icon="user"
                    :size="30"
                    class="user-link"
                    @click="showUser(chat.objectuser.user_id)"
                  />
                </div>
                <div class="chat-name">
                  <!-- Название чата -->
                  <div @click="showUser(chat.objectuser.user_id)" class="user-link">
                    {{ chat.objectuser.person }}
                  </div>
                </div>
              </div>
              <div class="chat-header__right">
                
              </div>
            </div>
            <div class="chat-body" id="messagesBlock">
              <div v-if="chat.messages">
                <div class="messages">
                  <div class="message mb-2" v-for="(message, index) in filterMessages" :key="message.message_id">
                    <div class="message-avatar">
                      <a-avatar
                        v-if="message.owner.avatar_path"
                        slot="avatar"
                        :src="message.owner.avatar_path"
                        :size="30"
                      />
                      <a-avatar
                        v-else
                        slot="avatar"
                        icon="user"
                        :size="30"
                      />
                    </div>
                    <div class="message-content">
                      <div class="message-header">
                        <div class="message-owner-name">
                          {{ message.owner.person }}
                        </div>
                        <div class="message-owner-date__label">
                          {{ message.ins_date_time }}
                        </div>
                      </div>
                      <div class="message-text">
                        {{ message.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="chat-footer">
              <div class="before-chat__input">
                <a-icon type="paper-clip" />
              </div>
              <div class="chat__input">
                <a-textarea class="" placeholder="Напишите сообщение" autosize v-model="text"/>
              </div>
              <div class="after-chat__input">
                <div class="chat-send__icon" @click="sendMessage">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .chat-container {
    border: 1px solid #e8e8e8;
    border-radius: 5px;
    position: relative;
  }
  .chat-header {
    background: white;
    z-index: 50;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 0 15px;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 1.5px rgba($color: #000000, $alpha: 0.05);
  }
  .chat-header__left {
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  .chat-link__back {
    font-size: 20px;
  }
  .chat-link__back:hover {
    cursor: pointer;
  }
  .chat-header__title {
    font-weight: bold;
    display: flex;
    align-items: center;
  }
  .chat-footer {
    background: white;
    z-index: 50;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    box-shadow: 0 -2px 1.5px rgba($color: #000000, $alpha: 0.05);
    border-top: 1px solid #e8e8e8;
    // height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 10px 10px;
    max-height: 40vh;
  }
  .chat-send__icon {
    // color: rgba(0, 0, 0, 0.65) !important;
    color: gray;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }
  .chat-send__icon:hover {
    cursor: pointer;
  }
  .chat__input {
    // position: absolute;
    width: 90vw;
    padding: 0 10px;
    // height: 100%;
    textarea {
      // position: relative;
      max-height: 37vh !important;
      overflow-y: auto !important;
    }
  }
  .after-chat__input {
    width: 5vw;
    display: flex;
    justify-content: center;
  }
  .before-chat__input {
    width: 5vw;
    display: flex;
    justify-content: center;
    i {
      font-size: 22px;
    }
  }
  .chat-body {
    z-index: 10;
    position: relative;
    height: 100%;
    padding: 60px 20px;
    overflow-y: scroll;
  }
  .messages {
    height: 100%;
    // overflow: scroll;
    .message {
      display: flex;
      justify-content: flex-start;
      .message-avatar {
        margin-right: 10px;
      }
      .message-content {
        .message-header {
          padding-top: 4px;
          display: flex;
          .message-owner-name {
            font-weight: bold;
            margin-right: 10px;
          }
          .message-owner-date__label {
            color: lightgray;
          }
        }
        .message-text {
          margin-top: 4px;
        }
      }
    }
  }
</style>
