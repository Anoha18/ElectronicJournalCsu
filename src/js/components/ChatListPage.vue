<script>
import { mapState, mapActions, mapMutations } from 'vuex';

export default {
  name: 'chat-list-page',
  data() {
    return {
      loading: true,
      searchChatValue: null,
    }
  },

  computed: {
    ...mapState([
      'user',
      'chatList',
    ]),

    filterChats() {
      if (this.searchChatValue != null && this.searchChatValue != '') {
        return this.chatList.filter((chat) => {
          if (chat.objectuser.search_person.includes(this.searchChatValue.toLowerCase())) {
            return chat;
          }
        });
      }
      return this.chatList.sort((a, b) => {
        return new Date(b.messages[b.messages.length - 1].ins_date) - new Date(a.messages[a.messages.length - 1].ins_date);
      });
      // return this.chatList.map((chat) => {
      //   return chat;
      // });
    },
  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    await this.getChatList();

    await this.setPageTitle('Сообщения');
    await this.setPageNavbar(true);

    this.loading = false;
  },

  methods: {
    ...mapActions([
      'checkUser',
      'getChatList',
    ]),

    ...mapMutations([
      'setPageTitle',
      'setPageNavbar',
    ]),

    async openChat(chatId) {
      await this.$router.push({
        name: 'chat',
        params: {
          id: chatId,
        },
      });
    },
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
      <div class="row justify-content-center pt-3">
        <div class="col-12 col-sm-10 col-md-8 col-lg-8">
          <a-input-search class="mb-3" placeholder="Поиск" v-model="searchChatValue" size="large"/>
          <div class="chat-list-container">
            <a-list :dataSource="filterChats">
              <a-list-item class="list-item" @click="openChat(chat.chat_id)" :key="chat.chat_id" slot="renderItem" slot-scope="chat, index">
                <a-list-item-meta>
                  <div slot="description">
                    <a-avatar
                      v-if="chat.messages[chat.messages.length - 1].owner.avatar_path &&
                        chat.messages[chat.messages.length - 1].owner_id != chat.objectuser.user_id"
                      slot="avatar"
                      :src="chat.messages[chat.messages.length - 1].owner.avatar_path"
                      :size="20"
                    />
                    <a-avatar
                      v-if="!chat.messages[chat.messages.length - 1].owner.avatar_path &&
                        chat.messages[chat.messages.length - 1].owner_id != chat.objectuser.user_id"
                      slot="avatar"
                      icon="user"
                      :size="20"
                    />
                    {{chat.messages[chat.messages.length - 1].text}}
                  </div>
                  <a slot="title">{{chat.objectuser.person}}</a>
                  <a-avatar
                    v-if="chat.objectuser.avatar_path"
                    slot="avatar"
                    :src="chat.objectuser.avatar_path"
                    :size="40"
                  />
                  <a-avatar
                    v-else
                    slot="avatar"
                    icon="user"
                    :size="40"
                  />
                </a-list-item-meta>
                <div class="ant-list-item-meta-description">{{chat.messages[chat.messages.length - 1].ins_date_time}}</div>
              </a-list-item>
            </a-list>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .chat-list-container {
    border: 1px solid #e8e8e8;
    border-radius: 5px;
  }
  .list-item {
    padding: 12px 20px !important;
  }
</style>
