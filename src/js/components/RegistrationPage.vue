<script>
import { mapActions, mapMutations } from 'vuex';

export default {
  data() {
    return {
      name: {
        text: null,
        state: null,
      },
      lastname: {
        text: null,
        state: null
      },
      email: {
        text: null,
        state: null,
      },
      phone: {
        text: null,
        state: null
      },
      userLogin: {
        text: null,
        state: null
      },
      password: {
        text: null,
        state: null
      },
      confirmPassword: {
        text: null,
        state: null,
      },
      props: {
        faculty: null,
        kafedra: null,
      },
      equalPasswords: null,
      send: false,
      facultyList: null,
      kafedraList: null,
    }
  },

  computed: {
    passwordComparison() {
      if (!this.password.text != null && this.password.text != null) {
        return (this.password.text == this.confirmPassword.text) ? null : false;
      }

      return null;
    },

    checkEmail() {
      if (this.email.state == false) return false;

      if (this.email.text != null) {
        let reg = /.+@.+\..+/i;
        return reg.test(this.email.text);
      }

      return null;
    },
  },

  async created() {
    if (await this.checkUser()) {
      await this.$router.push({name: 'home'});

      return;
    }

    await this.setPageNavbar(false);

    this.facultyList = await this.getProps({ brief: 'faculty' });
    //  this.kafedraList = await this.getPropsByParentId({parentId: faculty.id});
  },

  methods: {
    ...mapMutations([
      'setPageNavbar',
    ]),
    ...mapActions([
      'checkUser',
      'registration',
      'login',
      'getProps',
      'getPropsByParentId',
    ]),

    checkData() {
      let isCheck = true;
      if (this.name.text == null || this.name.text == '') {
        isCheck = false;
        this.name.state = false;
      } else this.name.state = null;

      if (this.lastname.text == null || this.lastname.text == '') {
        isCheck = false;
        this.lastname.state = false;
      } else this.lastname.state = null;

      if (this.email.text == null || this.email.text == '') {
        isCheck = false;
        this.email.state = false;
      } else this.email.state = null;

      // if (this.phone.text == null || this.phone.text == '') {
      //   isCheck = false
      //   this.phone.state = false
      // } else this.phone.state = true;
      let reg = /^[a-zA-Z0-9]*$/;
      if (this.userLogin.text == null || this.userLogin.text == '' || !reg.test(this.userLogin.text)) {
        isCheck = false;
        this.userLogin.state = false;
      } else this.userLogin.state = null;

      if (this.password.text == null || this.password.text == '') {
        isCheck = false;
        this.password.state = false;
      } else this.password.state = null;

      if (this.props.faculty == null) {
        isCheck = false;
        alert('Выберите факультет');
      }

      return isCheck;
    },

    async sendData() {
      this.send = true;

      if (!this.checkData()) {
        this.send = false;

        return;
      }

      let data = {
        name: this.name.text,
        lastname: this.lastname.text,
        email: this.email.text,
        login: this.userLogin.text,
        phone: this.phone.text,
        password: this.password.text,
        props: this.props,
      }

      let res = await this.registration(data);

      if (!res) {
        this.send = false;

        return;
      }

      res = await this.login({login: this.userLogin.text, password: this.password.text});
      
      if (!res) {
        this.send = false;

        return;
      }

      this.send = true;
      await this.$router.push({name: 'home'});
      
      return; 
    },

    async selectedFaculty(e) {
      if (e.target.value == 1) {
        this.props.faculty = null;
        this.props.kafedra = null;
        this.kafedraList = null;

        return -1;
      }

      this.props.kafedra = null;
      this.props.faculty = null;

      let faculty = JSON.parse(e.target.value);

      this.props.faculty = faculty;

      this.kafedraList = await this.getPropsByParentId({ parentId: faculty.id });

      return;
    },

    async selectedKafedra(e) {
      if (e.target.value == 1) {
        this.props.kafedra = null;

        return;
      }

      let kafedra = JSON.parse(e.target.value);

      this.props.kafedra = kafedra;

      return;
    },
  },
}
</script>

<template>
  <div class="container h-100">
    <div class="row h-100 justify-content-center align-items-center pt-5 pb-5">
      <div class="registration-body d-flex col-sm-10 col-md-7 col-lg-5 bg-light justify-content-around align-items-center flex-column pl-5 pr-5">
        <router-link to="login" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 20 20"><path d="M3.828 9l6.071-6.071-1.414-1.414L0 10l.707.707 7.778 7.778 1.414-1.414L3.828 11H20V9H3.828z"/></svg>
        </router-link>
        <!-- <h2 class="mt-2"></h2> -->
        <label class="d-block text-center fs-30">Регистрация</label>
        <b-input
          placeholder="Имя"
          name="name"
          v-model="name.text"
          :state="name.state"
          @keypress.enter="sendData"
        ></b-input>
        <b-input
          placeholder="Фамилия"
          name="lastname"
          v-model="lastname.text"
          :state="lastname.state"
          @keypress.enter="sendData"
        ></b-input>
        <div class="input-group">
          <div class="input-group-prepend">
            <label class="input-group-text" for="inputGroupSelect01">Факультет</label>
          </div>
          <select @change="selectedFaculty" class="custom-select" id="inputGroupSelect01">
            <option value="1" selected>Выберите факультет</option>
            <option v-for="item in facultyList" :key="item.id" :value="JSON.stringify(item)">{{item.value}}</option>
          </select>
        </div>
        <div v-if="kafedraList != null && kafedraList.length > 0" class="input-group">
          <div class="input-group-prepend">
            <label class="input-group-text" for="inputGroupSelect01">Кафедра</label>
          </div>
          <select @change="selectedKafedra" class="custom-select" id="inputGroupSelect01" :disabled="props.faculty == null">
            <option value="1" selected>Выберите кафедру</option>
            <option v-for="item in kafedraList" :key="item.id" :value="JSON.stringify(item)">{{item.value}}</option>
          </select>
        </div>
        <div class="w-100">
          <b-input
            placeholder="Электронная почта"
            name="email"
            v-model="email.text"
            :state="checkEmail "
            @keypress.enter="sendData"
            aria-describedby="email"
          ></b-input>
          <b-form-invalid-feedback id="email">
            Почта некорректна
          </b-form-invalid-feedback>
        </div>
        <b-input
          placeholder="Номер телефона"
          type="text"
          name="phone"
          v-model="phone.text"
          v-mask="'+7 ### ### ## ##'"
          @keypress.enter="sendData"
        ></b-input>
        <div class="w-100">
          <b-input
            placeholder="Логин"
            type="text"
            name="login"
            v-model="userLogin.text"
            :state="userLogin.state"
            aria-describedby="login"
            @keypress.enter="sendData"
          ></b-input>
          <b-form-invalid-feedback id="login">
            Только латинские буквы и цифры
          </b-form-invalid-feedback>
        </div>
        <b-input 
          placeholder="Пароль"
          type="password"
          name="password"
          v-model="password.text"
          :state="password.state"
          @keypress.enter="sendData"
        ></b-input>
        <div class="w-100">
          <b-input 
            placeholder="Повторите пароль"
            type="password"
            name="password"
            v-model="confirmPassword.text"
            :state="passwordComparison"
            aria-describedby="confirmPassword"
            @keypress.enter="sendData"
          ></b-input>
          <b-form-invalid-feedback id="confirmPassword">
            Пароли не совпадают
          </b-form-invalid-feedback>
        </div>
        <button class="btn btn-primary" @click="sendData" :disabled="send">Зарегистрироваться</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .registration-body {
    height: 550px; 
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0,0,0,0.15);
  }
  .back-link {
    position: absolute;
    left: 15px;
    top: 15px;
  }
  .back-link:hover {
    cursor: pointer;
  }
</style>