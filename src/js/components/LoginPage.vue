<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'login',
  data() {
    return {
      userLogin: {
        text: null,
        state: null,
      },
      password: {
        text: null,
        state: null,
      },
      remember: false,
      send: false,
    }
  },

  async created() {
    if (await this.checkUser()) {
      await this.$router.push({name: 'home'});
      
      return 
    }
    
    await this.setPageNavbar(false);
  },

  computed: {
    ...mapState([
      'page',
    ]),
  },

  methods: {
    ...mapMutations([
      'setPageNavbar'
    ]),

    ...mapActions([
      'login',
      'checkUser',
    ]),

    async sendData() {
      this.send = true;
      let isCheck = true;
      if ((this.userLogin.text == null) || (this.userLogin.text == '')) {
        this.userLogin.state = false;
        this.send = false;
        isCheck = false;
      } else {
        this.userLogin.state = null;
      }

      if ((this.password.text == null) || (this.password.text == '')) {
        this.password.state = false;
        this.send = false;
        isCheck = false;
      } else {
        this.password.state = null;
      }

      if (!isCheck) return;

      let res = await this.login({login: this.userLogin.text, password: this.password.text, remember: this.remember});

      if (!res) {
        this.send = false;

        return;
      }

      await this.$router.push({name: 'home'});
      return;
    }
  },
}
</script>


<template>
  <div class="container h-100">
    <div class="row h-100 justify-content-center align-items-center">

      <b-form class="login-body col-sm-9 col-md-6 col-lg-5 bg-light">
        <label class="d-block text-center fs-30">Вход</label>
        <b-input
          id="inline-form-input-name"
          class="mb-2 mr-sm-2 mb-sm-0"
          placeholder="Логин"
          :state="userLogin.state"
          v-model="userLogin.text"
          @keypress.enter="sendData"
        ></b-input>

        <b-input-group class="mt-2 mb-2 mr-sm-2 mb-sm-0">
          <b-input 
            id="inline-form-input-username" 
            placeholder="Пароль" 
            type="password"
            :state="password.state"
            v-model="password.text"
            @keypress.enter="sendData"
            ></b-input>
        </b-input-group>

        <!-- <b-form-checkbox class="mt-2 mb-2 mr-sm-2 mb-sm-0" v-model="remember">Запомнить меня</b-form-checkbox> -->
        <router-link to="registration" href="#" class="primary">Регистрация</router-link>

        <b-button class="w-100 mt-2 mb-2" variant="primary" @click="sendData" :disabled="send">Войти</b-button>
      </b-form>
    </div>
  </div>
</template>

<style >
  .login-body {
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0,0,0,0.15);
  }
</style>