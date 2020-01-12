<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  props: {
    id: {
      required: true,
    },
  },

  data() {
    return {
      loading: true,
    }
  },

  computed: {
    ...mapState([
      'user',
      'tablesList',
    ])
  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    await this.getTablesList({journal_id: +this.id});

    await this.setPageTitle('Журнал');
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
      'getTablesList',
    ]),

    async openTable(tableId) {
      await this.$router.push({
        name: 'table',
        params: {
          id: tableId,
        },
      });
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
    <div v-else class="container h-100 mt-0">
      <div class="row">

        <div
          v-for="table in tablesList" :key="table.table_id"
          class="p-0 m-0 card border-none col-12 col-sm-6 col-md-5 col-xl-3 mt-3 justify-content-center align-items-center flex-column" 
          style="width: 350px;">
          <div
          style="width: 250px; height: 320px;"
          class="card-body z2 position-relative"
          @click="openTable(table.table_id)">
            <div class="card-body-header">
              {{table.name}}
              <div class="header-label">
                {{(table.props.tip_zanyatiya && table.props.tip_zanyatiya.val) || ''}}
              </div>
            </div>
            <div class="card-body-item mt-5">Факультет: {{table.props.faculty.val}}</div>
            <div class="card-body-item mt-2">Кафедра: {{table.props.kafedra.val}}</div>
            <div class="card-body-item mt-2">Группа: {{table.props.nomer_gruppy.val}}</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

