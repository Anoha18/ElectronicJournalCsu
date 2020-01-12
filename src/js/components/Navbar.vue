<script>
import {mapState, mapActions} from 'vuex';

export default {
  name: 'navbar',
  data() {
    return {
      openSidemenu: false,
    }
  },
  computed: {
    ...mapState([
      'page',
      'user',
    ]),
  },

  methods: {
    ...mapActions([
      'logout',
    ]),

    async exit() {
      await this.logout();

      await this.$router.push({
        name: 'login',
      });

      return;
    },
  },
}
</script>

<template>
  <div>

    <b-navbar class="z100 pl-2 fixed-top"  type="dark" color="blue" variant="primary">
        <b-navbar-nav class="w-100">
          <button type="button" class="btn btn-primary" @click="openSidemenu = !openSidemenu">
            <span class="navbar-toggler-icon"></span>
          </button>
          <b-navbar-brand class="ml-5" href="#">{{page.title}}</b-navbar-brand>

          <b-nav-item-dropdown class="ml-auto" right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <a-avatar v-if="user && user.avatar_path != null" :size="30" class="mr-2 object-fit-cover" :src="user.avatar_path + '?=40'" />
            <a-avatar class="mr-2" v-else :size="35" icon="user" />
            <em>{{(user && user.person) || ''}}</em>
          </template>
          <b-dropdown-item class="position-relative" href="#">
            <router-link class="w-100 h-100 p-0 d-block" to="/profile/">
              Профиль
            </router-link>
          </b-dropdown-item>
          <b-dropdown-item class="position-relative" v-if="user && user.admin" href="#">
            <router-link class="w-100 h-100 p-0 d-block" to="/admin/insert/student/">
              Добавить студента
            </router-link>
          </b-dropdown-item>
          <b-dropdown-item class="position-relative" @click="exit" href="#"><div  class="text-danger w-100 h-100 p-0">Выход</div></b-dropdown-item>
        </b-nav-item-dropdown>
        </b-navbar-nav>
    </b-navbar>
    <div ref="sideMenu" :class="[openSidemenu ? 'w-250px' : '']" class="sidenav">
      <div class="sidenav-body pt-2">
        <div class="body__item position-relative" :class="[$route.name == 'home'?'bg-active' : '']">
          <router-link class="position-absolute top-0 left-0 h-100 w-100"  to="/"></router-link>
          <div class="item d-flex align-items-center">
            <div class="item-icon">
            <!-- <router-link to="/"> -->
              <svg height="40px" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="40px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="_x31_52_x2C__Twitter_x2C__Text_x2C__Chat">
                  <g>
                    <g>
                      <path d="M410,107.999v294c0,18.23-14.77,33-33,33H143c-18.23,0-33-14.77-33-33v-294     c0-18.23,14.77-33,33-33h234C395.23,74.999,410,89.769,410,107.999z" style="fill:#D7DEED;"/>
                    </g>
                      <g>
                        <g>
                          <path d="M370,164.999H150c-5.523,0-10-4.477-10-10s4.477-10,10-10h220c5.522,0,10,4.477,10,10      S375.522,164.999,370,164.999z" style="fill:#AFB9D2;"/>
                        </g>
                      </g>
                      <g>
                        <g>
                          <path d="M370,244.999H150c-5.523,0-10-4.477-10-10s4.477-10,10-10h220c5.522,0,10,4.477,10,10      S375.522,244.999,370,244.999z" style="fill:#AFB9D2;"/>
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M280,324.998H150c-5.523,0-10-4.477-10-10c0-5.521,4.477-10,10-10h130c5.522,0,10,4.479,10,10      C290,320.521,285.522,324.998,280,324.998z" style="fill:#AFB9D2;"/>
                          </g>
                        </g>
                      </g>
                    </g>
                    <g id="Layer_1"/>
                  </svg>
              <!-- </router-link> -->
            </div>
            <div class="item-label">
              <!-- <router-link to="/"> -->
                Мой журнал
              <!-- </router-link> -->
            </div>
          </div>
        </div>
        <div class="body__item position-relative mt-3" :class="[$route.name == 'access_journals'?'bg-active' : '']">
          <router-link class="position-absolute top-0 left-0 h-100 w-100" to="/access_journals/"></router-link>
          <div class="item d-flex align-items-center">
            <div class="item-icon">
              <!-- <router-link to="/access_journals/">
              </router-link> -->
              <svg height="40px" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="40px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="_x31_55_x2C__Open_x2C__Book_x2C__Page_x2C__Layout_x2C__Cover"><g><g><path d="M466,114.999v238c0,14.361-11.64,26-26,26l-158,31c-14.36,0-26-11.639-26-26v-238     c0-14.36,11.64-26,26-26l158-31C454.36,88.999,466,100.639,466,114.999z" style="fill:#AFB9D2;"/></g><g><path d="M256,145.999v238c0,14.361-11.64,26-26,26l-158-31c-14.36,0-26-11.639-26-26v-238     c0-14.36,11.64-26,26-26l158,31C244.36,119.999,256,131.639,256,145.999z" style="fill:#D7DEED;"/></g></g></g><g id="Layer_1"/></svg>
            </div>
            <div class="item-label">
              <!-- <router-link to="/access_journals/">
              </router-link> -->
              Доступные журналы
            </div>
          </div>
        </div>

        <div class="body__item position-relative mt-3" v-if="user && user.dean_worker" :class="[$route.name == 'dean.journals'?'bg-active' : '']">
          <router-link class="position-absolute top-0 left-0 h-100 w-100" to="/dean/journals/"></router-link>
          <div class="item d-flex align-items-center">
            <div class="item-icon">
              <!-- <router-link to="/dean/journals/">
              </router-link> -->
              <svg height="40px" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="40px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="_x31_71_x2C__Contacts_x2C__Mane_x2C__Twitter"><g><g><path d="M410,410.498v16H90v-16c0-88.369,71.63-160,160-160c44.18,0,84.18,17.91,113.14,46.861     C392.09,326.318,410,366.318,410,410.498z" style="fill:#86DCFD;"/></g><g><circle cx="250" cy="166.499" r="83" style="fill:#FFD8A8;"/></g></g></g><g id="Layer_1"/></svg>
            </div>
            <div class="item-label">
                Страница деканата
              <!-- <router-link to="/dean/journals/">
              </router-link> -->
            </div>
          </div>
        </div>
        <div class="body__item position-relative mt-3" v-if="user && user.dean_worker" :class="[$route.name == 'dean.reports'?'bg-active' : '']">
          <router-link class="position-absolute top-0 left-0 h-100 w-100" to="/dean/reports/"></router-link>
          <div class="item d-flex align-items-center">
            <div class="item-icon">
              <!-- <router-link to="/dean/journals/">
              </router-link> -->
              <svg height="40px" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="40px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="_x31_64_x2C__Add_x2C__Contact_x2C__User_x2C__Twitter"><g><g><path d="M475.02,383.299v13.199H301v-13.199c0-39.58-17.42-75.08-45-99.27     c23.23-20.381,53.68-32.741,87.01-32.741C415.92,251.289,475.02,310.389,475.02,383.299z" style="fill:#40B3E2;"/></g><g><path d="M256,284.029c27.58,24.189,45,59.689,45,99.27v13.199h-90H36.98v-13.199     c0-36.461,14.78-69.461,38.66-93.35c23.89-23.891,56.9-38.661,93.35-38.661C202.32,251.289,232.77,263.648,256,284.029z" style="fill:#86DCFD;"/></g><g><circle cx="343.01" cy="181.979" r="68.48" style="fill:#EABD8C;"/></g><g><circle cx="168.99" cy="181.979" r="68.48" style="fill:#FFD8A8;"/></g></g></g><g id="Layer_1"/></svg>
            </div>
            <div class="item-label">
              <!-- <router-link to="/dean/journals/">
              </router-link> -->
                Отчеты
            </div>
          </div>
        </div>

        <div class="body__item position-relative mt-3" :class="[$route.name == 'chats' ? 'bg-active' : '']">
          <router-link class="position-absolute top-0 left-0 h-100 w-100" to="/chats"></router-link>
          <div class="item d-flex align-items-center">
            <div class="item-icon">
              <svg height="40px" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="40px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="_x31_58_x2C__Twitter_x2C__Chat_x2C__Chatting"><g><path d="M456,223.418c0,59.281-46.67,107.65-105.26,110.4v0.131l-105.27,63.16l12.64-63.16H166.53    c-30.53,0-58.16-12.371-78.16-32.371c-20-20.01-32.37-47.64-32.37-78.16c0-61.04,49.48-110.53,110.53-110.53h178.94    c30.53,0,58.16,12.37,78.16,32.37C443.63,165.269,456,192.898,456,223.418z" style="fill:#95A5A5;"/></g></g><g id="Layer_1"/></svg>
            </div>
            <div class="item-label">
              Сообщения
            </div>
          </div>
        </div>

        </div>
      </div>
    <div class="backdrop" v-if="openSidemenu" @click="openSidemenu = false"></div>
  </div>
  
</template>

<style>
.z100 {
  z-index: 100 !important;
}

.sidenav {
  height: 100%; /* 100% Full-height */
  width: 60px; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 99;
  top: 0; /* Stay at the top */
  left: 0;
  background-color: #007bff; /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 60px; /* Place content 60px from the top */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
}

.sidenav:hover {
  /* width: 250px; */
}

/* .sidenav a {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
} */

/* .sidenav a:hover {
  color: #f1f1f1;
} */

.sidenav .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

@media screen and (max-height: 450px) {
  .sidenav {padding-top: 15px;}
  .sidenav a {font-size: 18px;}
}

.w-250px {
  width: 250px;
}
.backdrop {
  display: block;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 98;
}
.sidenav-body {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding-left: 10px;
  padding-right: 10px;
}
.body__item {
  /* display: flex;
  align-items: center; */
  border-radius: 5px;
}
.body__item:hover {
  background-color: #0362c7
}
.bg-active {
  background-color: #0362c7
}
.item-label {
  color: white;
  margin-left: 10px;
  display: inline;
  white-space: nowrap;
}
.body__item:hover {
  cursor: pointer;
}
.item-icon a, .item-label a{
  
  color: white;
}
.item-icon a:hover, .item-label a:hover {
  color: white;
  text-decoration: none;
}
</style>