<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import ru_RU from 'ant-design-vue/lib/date-picker/locale/ru_RU.js';

export default {
  data() {
    return {
      ru_RU,
      loading: true,
      facultyList: [],
      kafedraList: [],
      groupList: [],
      faculty: null,
      kafedra: null,
      nomer_gruppy: null,
      name: null,
      lastname: null,
      patronymic: null,
      birthdate: null,
      send: false,
    };
  },

  computed: {
    ...mapState([
      'user',
    ]),
  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    if (!this.user.admin) {
      await this.$router.push({name: 'home'});

      return;
    }

    this.facultyList = await this.getProps({brief: 'faculty'});

    await this.setPageTitle('Добавление студента');
    await this.setPageNavbar(true);

    this.loading = false;
  },

  methods: {
    ...mapMutations([
      'setPageNavbar',
      'reloadPage',
      'setPageTitle',
    ]),

    ...mapActions([
      'checkUser',
      'getProps',
      'getPropsByParentId',
      'addStudent',
    ]),

    async selectedFaculty(value) {
      this.kafedra = null;
      this.kafedraList = [];
      this.groupList = [];
      this.nomer_gruppy = null;
      this.faculty = null;

      let faculty = JSON.parse(value);

      this.faculty = faculty;

      this.kafedraList = await this.getPropsByParentId({parentId: faculty.id});

      return;
    },

    async selectedKafedra(value) {
      this.kafedra = null;
      this.groupList = [];
      this.nomer_gruppy = null;

      let kafedra = JSON.parse(value);

      this.kafedra = kafedra;

      this.groupList = await this.getPropsByParentId({parentId: kafedra.id});

      return;
    },

    async selectedGroup(value) {
      this.nomer_gruppy = null;

      let nomerGruppy = JSON.parse(value);

      this.nomer_gruppy = nomerGruppy;

      return;
    },

    async add() {
      this.send = true;

      let data = {
        props: {
          faculty: this.faculty,
          kafedra: this.kafedra,
          nomer_gruppy: this.nomer_gruppy,
        },
        name: this.name,
        lastname: this.lastname,
        patronymic: this.patronymic,
        birthdate: this.birthdate,
      }

      await this.addStudent(data);

      this.send = false;

      await this.reloadPage();
    },
  }
}
</script>

<template>
  <div class="body relative">
    <div class="page-spinner" v-if="loading || send">
      <a-spin tip="Загрузка...">
      </a-spin>
    </div>
    <div v-else class="container h-100 pt-5">
      <div class="row">
        <div class="col-12">
          <a-select
            class="w-100 mt-5"
            showSearch
            placeholder="Выберите факультет"
            optionFilterProp="children"
            notFoundContent="Факультет не найден"
            @change="selectedFaculty"
          >
            <a-select-option v-for="faculty in facultyList" :key="faculty.id"  :value="JSON.stringify(faculty)">{{faculty.value}}</a-select-option>
          </a-select>

          <a-select
            class="w-100 mt-3"
            showSearch
            placeholder="Выберите кафедру"
            optionFilterProp="children"
            notFoundContent="Кафедра не найдена"
            @change="selectedKafedra"
            v-if="kafedraList.length > 0"
          >
            <a-select-option v-for="kafedra in kafedraList" :key="kafedra.id"  :value="JSON.stringify(kafedra)">{{kafedra.value}}</a-select-option>
          </a-select>
          
          <a-select
            class="w-100 mt-3"
            showSearch
            placeholder="Выберите группу"
            optionFilterProp="children"
            notFoundContent="Группа не найдена"
            @change="selectedGroup"
            v-if="groupList.length > 0"
          >
            <a-select-option v-for="group in groupList" :key="group.id"  :value="JSON.stringify(group)">{{group.value}}</a-select-option>
          </a-select>
        </div>
        <div class="col-12 mt-5">
           <a-input class="mt-3" placeholder="Фамилия" v-model="lastname"/>
           <a-input class="mt-3" placeholder="Имя" v-model="name"/>
           <a-input class="mt-3" placeholder="Отчество" v-model="patronymic"/>
           <a-date-picker placeholder="День Рождения" v-model="birthdate" :locale="ru_RU" class="mt-3 w-100" ref="newClassDatePicker" style="min-width: 50px;" :format="'DD.MM.YYYY'" />
           <a-button class="mt-3" @click="add" type="primary">Добавить</a-button>
        </div>
      </div>
    </div>
  </div>
</template>
