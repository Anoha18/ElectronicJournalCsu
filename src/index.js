import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { VueMaskDirective } from 'v-mask';
import Ant from 'ant-design-vue';

import app from './js/app.vue';
import store from './store/index';
import router from './router.js';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'ant-design-vue/dist/antd.css';

Vue.use(BootstrapVue);
Vue.directive('mask', VueMaskDirective);
Vue.use(Ant);

new Vue ({
  el: '#app',
  router,
  store,
  components: {
    app
  },
  render: h => h(app)
});
