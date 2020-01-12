<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import ru_RU from 'ant-design-vue/lib/date-picker/locale/ru_RU.js';

export default {
  data() {
    return {
      ru_RU,
      loading: true,
      facultyList: [],
      faculty: null,
      kafedraList: [],
      kafedra: null,
      groupList: [],
      nomer_gruppy: null,
      studentList: [],
    }
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

    if (!this.user.dean_worker) {
      await this.$router.push({name: 'home'});

      return;
    }

    this.facultyList = await this.getProps({brief: 'faculty'});

    await this.setPageTitle('Отчеты');
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
      'getStudentsByGroup',
    ]),

    async selectedFaculty(value) {
      this.kafedra = null;
      this.kafedraList = [];
      this.groupList = [];
      this.nomer_gruppy = null;
      this.faculty = null;
      this.studentList = [];

      let faculty = JSON.parse(value);

      this.faculty = faculty;

      this.kafedraList = await this.getPropsByParentId({parentId: faculty.id});

      return;
    },

    async selectedKafedra(value) {
      this.kafedra = null;
      this.groupList = [];
      this.nomer_gruppy = null;
      this.studentList = [];

      let kafedra = JSON.parse(value);

      this.kafedra = kafedra;

      this.groupList = await this.getPropsByParentId({parentId: kafedra.id});

      return;
    },

    async selectedGroup(value) {
      this.studentList = [];
      this.nomer_gruppy = null;

      let nomerGruppy = JSON.parse(value);

      this.nomer_gruppy = nomerGruppy;

      this.studentList = await this.getStudentsByGroup(nomerGruppy);

      return;
    },

    async openStudentReport(studentId) {
      await this.$router.push({
        name: 'dean.report.student',
        params: {
          id: studentId,
        },
      });
    },

  }
}
</script>

<template>
 <div class="body relative">
    <div class="page-spinner" v-if="loading">
      <a-spin tip="Загрузка...">
      </a-spin>
    </div>
    <div v-else class="container h-100">
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


        <a-list class="mt-4" :dataSource="studentList" :locale="ru_RU" :emptyText="'Нет данных'">
          <a-list-item @click="openStudentReport(student.student_id)" class="list-item" slot="renderItem" slot-scope="student">
            <a-list-item-meta>
              <div slot="title">{{student.person}}</div>
              <a-avatar
                slot="avatar"
                src="/static/img/user.png"
              />
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </div>
    </div>
 </div>
</template>

<style>
  .list-item:hover {
    background: rgba(0, 0, 0, 0.1);
    cursor: pointer;
    /* box-shadow: 0 0 5px rgba(0,0,0,0.2); */
  }
</style>