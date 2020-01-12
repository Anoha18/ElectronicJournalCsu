<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  props: {
    id: {
      require: true,
    },
  },

  data() {
    return {
      loading: true,
      student: null,
      tableList: [],
      table: null,
      request: false,
      allInfo: null,
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

    if (!this.user.dean_worker) {
      await this.$router.push({name: 'home'});

      return;
    }

    this.student = await this.getStudentById(+this.id);
    this.allInfo = await this.getInfoByStudent(+this.id);
    this.tableList = await this.getTablesByStudent(+this.id);
    await this.$nextTick();
    
    if (this.tableList.length != 0) {
      this.request = true;
      this.table = await this.getTable({tableId: this.tableList[0].table_id, infoStudent: this.student.student_id});
      this.request = false;
    }

    await this.setPageTitle('Информация о студенте');
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
      'getStudentById',
      'getTablesByStudent',
      'getClassesByTableId',
      'getTable',
      'getInfoByStudent',
    ]),

    async changeTable(key) {
      this.request = true;
      this.classes = [];
      this.table = await this.getTable({tableId: key, infoStudent: this.student.student_id});
      this.request = false;
    },

    async openTable(tableId) {
      await this.$router.push({
        name: 'table',
        params: {
          id: tableId,
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
    <div v-else class="container h-100 pt-5">
      <div class="row mb-5 justify-content-center">
        <div class="col-12 col-sm-10 col-md-4 col-xl-4 d-flex justify-content-center align-items-center">
          <a-avatar class="mr-2 d-flex align-items-center justify-content-center" :size="150" icon="user" />
        </div>
        <div class="col-12 col-sm-10 col-md-4 col-xl-4">
          <div class="student-fio">
            <ul class="w-100 list-group list-group-flush">
              <li class="list-group-item">
                <span class="list-group-item__label">
                  Имя:
                </span>
                {{ student.name }}
              </li>
              <li class="list-group-item">
                <span class="list-group-item__label">
                  Фамилия:
                </span>
                {{ student.lastname }}
              </li>
              <li class="list-group-item">
                <span class="list-group-item__label">
                  Отчество:
                </span>
                {{ student.patronymic || '-' }}
              </li>
              <li class="list-group-item">
                <span class="list-group-item__label">
                  Факультет:
                </span>
                {{ (student.props && student.props.faculty && student.props.faculty.val) || '-' }}
              </li>
              <li class="list-group-item">
                <span class="list-group-item__label">
                  Кафедра:
                </span>
                {{ (student.props && student.props.kafedra && student.props.kafedra.val) || '-' }}
              </li>
              <li class="list-group-item">
                <span class="list-group-item__label">
                  Группа:
                </span>
                {{ (student.props && student.props.nomer_gruppy && student.props.nomer_gruppy.val) || '-' }}
              </li>
            </ul>
          </div>
        </div>
        </div>

        <h3 v-if="allInfo && allInfo != null">Информация о посещении</h3>
        <div v-if="allInfo && allInfo != null" class="row mb-5 justify-content-center">
            <div class="col-12 col-sm-10 col-md-8 col-xl-8">
              <ul class="w-100 list-group list-group-flush">
                <li class="list-group-item">
                  <span class="list-group-item__label">
                    Всего занятий:
                  </span>
                  {{ (allInfo && allInfo.all_classes) || '-' }}
                </li>
                <li class="list-group-item">
                  <span class="list-group-item__label">
                    Посещено занятий:
                  </span>
                  {{ (allInfo && allInfo.in_classes) || '-' }}
                </li>
                <li class="list-group-item">
                  <span class="list-group-item__label">
                    Пропущено занятий:
                  </span>
                  {{ (allInfo && allInfo.missed_classes) || '-' }}
                </li>
                <li class="list-group-item">
                  <span class="list-group-item__label">
                    % посещенных занятий:
                  </span>
                  {{ (allInfo && allInfo.percent_in_classes) || '-' }}
                </li>
                <li class="list-group-item">
                  <span class="list-group-item__label">
                    % пропущенных занятий:
                  </span>
                  {{ (allInfo && allInfo.percent_missed_classes) || '-' }}
                </li>
              </ul>
            </div>
         </div>

        <h3 v-if="tableList.length != 0">Детальная информация</h3>
         <div class="row mb-5 justify-content-center">
          <div class="col-12 col-sm-12 col-md-10 col-xl-10">

            <a-tabs class="w-100"  tabPosition="left" @change="changeTable">
              <a-tab-pane v-for="t in tableList" :key="t.table_id" class="w-100" :tab="t.name">
                <div class="tab-body w-100 h-100 relative">
                  <div class="page-spinner" v-if="request">
                      <a-spin tip="Загрузка...">
                      </a-spin>
                  </div>
                  <div v-if="table != null && !request">
                    <ul class="w-100 list-group list-group-flush">
                      <li class="list-group-item">
                        <span class="list-group-item__label">
                          Тип занятия:
                        </span>
                        {{ (table.props && table.props.tip_zanyatiya && table.props.tip_zanyatiya.val) || '-' }}
                      </li>
                      <li class="list-group-item">
                        <span class="list-group-item__label">
                          Всего занятий:
                        </span>
                        {{ (table.info_student && table.info_student.all_classes) || '-' }}
                      </li>
                      <li class="list-group-item">
                        <span class="list-group-item__label">
                          Посещено занятий:
                        </span>
                        {{ (table.info_student && table.info_student.in_classes) || '-' }}
                      </li>
                      <li class="list-group-item">
                        <span class="list-group-item__label">
                          Пропущено занятий:
                        </span>
                        {{ (table.info_student && table.info_student.missed_classes.toString()) || '-' }}
                      </li>
                      <li class="list-group-item">
                        <span class="list-group-item__label">
                          % посещенных занятий:
                        </span>
                        {{ (table.info_student && table.info_student.percent_in_classes) || '-' }}
                      </li>
                      <li class="list-group-item">
                        <span class="list-group-item__label">
                          % пропущенных занятий:
                        </span>
                        {{ (table.info_student && table.info_student.percent_missed_classes.toString()) || '-' }}
                      </li>
                      <li class="list-group-item">
                        <span class="list-group-item__label">
                          Средний балл:
                        </span>
                        {{ (table.info_student && table.info_student.avg_mark) || '-' }}
                      </li>
                    </ul>
                    <a-button class="mt-3" @click="openTable(table.table_id)" type="primary">Открыть таблицу</a-button>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .student-avatar {
    border-radius: 50%;
    overflow: hidden;
    display: flex;
  }
</style>