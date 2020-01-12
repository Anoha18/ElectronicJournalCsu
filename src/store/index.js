'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import { req } from './fetch';
import { send } from '../wss';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    page: {
      navbar: true,
      title: '',
      reload: false,
    },
    tablesList: [],
    table: null,
    webSocket: null,
    chatList: [],
    chat: null,
  },

  mutations: {
    setPageNavbar(state, status) {
      state.page.navbar = status;
    },
    setPageTitle(state, title) {
      state.page.title = title;
    },
    setUser(state, user) {
      state.user = user;
    },
    reloadPage(state) {
      state.page.reload = true;
      setTimeout(() => {
        state.page.reload = false;
      }, 0);
    },
    setTablesList(state, tablesList) {
      state.tablesList = tablesList;
    },
    setTable(state, table) {
      state.table = table;
    },
    setWebSocket(state, connection) {
      state.webSocket = connection;
    },
    setChatList(state, chatList) {
      state.chatList = chatList;
    },
    setMessage(state, message) {
      state.chatList.map((chat) => {
        if (message.chat_id && chat.chat_id == message.chat_id) {
          if (Array.isArray(chat.messages)) {
            chat.messages.push(message);
          } else {
            chat.messages = [];
            chat.messages.push(message);
          }
        }
      });

      if (state.chat != null && message.chat_id == state.chat.chat_id) {
        if (Array.isArray(state.chat.messages)) {
          state.chat.messages.push(message);
        } else {
          state.chat.messages = [];
          state.chat.messages.push(message);
        }
      }
    },
    setChat(state, chat) {
      state.chat = chat;
    },
  },
  
  actions: {
    async login({commit}, data) {
      let {error, result} = await req('/login', data);
      
      if (error) {
        alert(error);
        console.error(error);

        return false;
      }
      
      await commit('setUser', result);

      return true;
    },

    async checkUser({commit, dispatch}) {
      const { result } = await req('/checkUser');

      if (!result) {
        return false;
      }

      await commit('setUser', result);
      await dispatch('joinWebSocket');

      return true;
    },

    async logout({commit}) {
      let res = await req('/logout');

      return;
    },

    async registration({commit}, data) {
      let {error, result} = await req('/registration', data);
      
      if (error) {
        alert(error);
        console.error(error);

        return false;
      }

      return true;
    },

    async getProps({commit}, data) {
      let {error, result} = await req('/getPropsList', data);

      if (error) {
        console.error(error);

        return;
      }

      return result;
    },

    async getPropsByParentId({commit}, data) {
      let {error, result} = await req('/getPropsByParentId', data);

      if (error) {
        console.error(error);

        return;
      }

      return result;
    },

    async addTable({commit}, data) {
      let {error, result} = await req('/addTable', data);

      if (error) {
        alert(error);
        console.error(error);

        return false;
      }

      return true;
    },

    async getTablesList({commit}, data) {
      let {error, result} = await req('/getTablesList', data);

      if (error) {
        console.error(error);

        return;
      }

      await commit('setTablesList', result);

      return result;
    },

    async getTable({commit}, data) {
      let {error, result} = await req('/getTable', data);

      if (error) {
        console.error(error);

        return;
      }

      await commit('setTable', result);
      
      return result;
    },

    async saveItem({commit}, data) {
      let {error, result, wrong} = await req('/saveItem', data);

      if (error) {
        console.error(error);

        return;
      }

      if (wrong) return alert(wrong);

      return result;
    },

    async getClassesByTableId({ commit }, table_id) {
      let { error, result } = await req('/getClassesByTableId', { table_id });

      if (error) {
        alert(error);

        console.error(error);

        return;
      }

      return result;
    },

    async setTableColumnData({ commit }, data) {
      let { error, result } = await req('/setTableColumnData', data);

      if (error) {
        console.error(error);

        return;
      }

      return result;
    },

    async getUsersByProp({ commit }, data) {
      let { error, result } = await req('/getUsersByProp', data);

      if (error) {
        console.error(error);

        return;
      }

      return result;
    },

    async addAccess({ commit }, data) {
      let { error, result } = await req('/addAccess',data);

      if (error) {
        console.error(error);

        return;
      }

      return result;
    },

    async getAccessList({ commit }, data) {
      let { error, result } = await req('/getAccessList', data);

      if (error) {
        console.error(error);

        return;
      }

      return result;
    },

    async deleteAccessLink({commit}, data) {
      let { error, result } = await req('/deleteAccessLink', data);

      if (error) return console.error(error);

      return result;
    },

    async getAccessJournals({commit}, data) {
      let { error, result } = await req('/getAccessJournals', data);

      if (error) return console.error(error);

      return result;
    },

    async adminGetJournals({}) {
      let { error, result } = await req('/dean/getJournals');

      if (error) return console.error(error);

      return result;
    },

    async getStudentsByGroup({}, group) {
      let { error, result } = await req('/getStudentsByGroup', group);

      if (error) return console.error(error);

      return result;
    },

    async getStudentById({}, studentId) {
      let { error, result } = await req('/getStudentById', {studentId});

      if (error) return console.error(error);

      return result;
    },

    async addStudent({}, student) {
      let { error, result } = await req('/admin/addStudent', student);

      if (error) return console.error(error);

      return result;
    },

    async getTablesByStudent({}, studentId) {
      let { error, result } = await req('/getTablesByStudent', {studentId});

      if (error) return console.error(error);

      return result;
    },

    async getInfoByStudent({}, studentId) {
      let { error, result } = await req('/getInfoByStudent', {studentId});

      if (error) return console.error(error);

      return result;
    },

    async uploadFile({}, {file, oid, ltid, ftype = 'image'}) {
      const data = new FormData();

      data.append('file', file);
      data.append('oid', oid);
      data.append('ftype', ftype);

      if (ltid) data.append('ltid', ltid);

      const response = await fetch('/upload/file',{
        method: 'POST',
        body: data,
      });

      if (response.error) return console.error(response.error);

      return response.result;
    },

    async updateUserAccount({commit}, data) {
      let { error, result } = await req('/updateUserAccount', data);

      if (error) {
        alert(error);
        console.error(error);

        return false;
      }

      await commit('setUser', result);

      return true;
    },

    async setStudentColumn({}, data) {
      let { error, result } = await req('/setStudentColumn', data);

      if (error) {
        console.error(error);

        return;
      }

      return result;
    },

    async getStudentsByTableId({}, tableId) {
      let { error, result } = await req('/getStudentsByTableId', { tableId });

      if (error) return console.error(error);

      return result;
    },

    async getUserById({}, userId) {
      const { error, result } = await req('/getUserById', { userId });

      if (error) return console.error(error);

      return result;
    },

    async addMessage({}, data) {
      const { error, instance } = await req('/addMessage', data);

      if (error) return console.error(error);

      const item = {
        type: 'message',
        message: instance,
      }

      await send(item, this.state.webSocket);

      return instance;
    },

    async getChatList({commit}) {
      const { error, result } = await req('/getChatList', { userId: this.state.user.user_id });

      if (error) return console.error(error);

      await commit('setChatList', result);

      return result;
    },

    joinWebSocket({commit}) {
      if (!this.state.user.user_id) {
        return;
      }

      const data = {
        type: 'join',
        user: this.state.user,
      };

      send(data, this.state.webSocket);
    },

    async getChat({}, chatId) {
      const { error, result } = await req('/getChat', { chatId });

      if (error) return console.error(error);

      return result;
    },
  }
});
