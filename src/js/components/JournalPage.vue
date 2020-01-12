<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  data() {
    return {
      name: null,
      faculty: null,
      kafedra: null,
      nomer_gruppy: null,
      facultyList: [],
      kafedraList: [],
      groupList: [],
      typeClassList: [],
      canBeSend: false,
      sending: false,
      tip_zanyatiya: null,
      loading: true,
      editTable: null,
    }
  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    await this.setPageTitle('Мой журнал');
    await this.setPageNavbar(true);

    await this.getTablesList({journal_id: this.user.journal_id});

    this.loading = false;
  },

  computed: {
    ...mapState([
      'user',
      'tablesList',
    ])
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
      'addTable',
      'getTablesList',
      'setTableColumnData',
    ]),

    async openAddTableModal() {
      this.facultyList = await this.getProps({brief: 'faculty'});
      this.typeClassList = await this.getProps({brief: 'tip_zanyatiya'})
    },

    async selectedFaculty(e) {
      if (e.target.value == 1) {
        this.faculty = null;
        this.canBeSend = false;

        return -1;
      }

      this.kafedra = null;
      this.nomer_gruppy = null;
      this.faculty = null;

      let faculty = JSON.parse(e.target.value);

      this.faculty = faculty;

      this.kafedraList = await this.getPropsByParentId({parentId: faculty.id});

      return;
    },

    async selectedKafedra(e) {
      if (e.target.value == 1) {
        this.kafedra = null;
        this.canBeSend = false;

        return;
      }

      let kafedra = JSON.parse(e.target.value);

      this.kafedra = kafedra;

      this.groupList = await this.getPropsByParentId({parentId: kafedra.id});

      return;
    },

    async selectedGroup(e) {
      if (e.target.value == 1) {
        this.nomer_gruppy = null;
        this.canBeSend = false;

        return;
      }

      let nomerGruppy = JSON.parse(e.target.value);

      this.nomer_gruppy = nomerGruppy;

      return this.canBeSend = true;
    },

    async addTableJournal() {
      if (this.name == null || this.name == '') return;

      if (this.faculty == null ||
        this.kafedra == null ||
        this.nomer_gruppy == null) return;

      if (this.nomer_gruppy.parent_id != this.kafedra.id ||
        this.kafedra.parent_id != this.faculty.id) return;

      let data = {
        journal_id: this.user.journal_id,
        name: this.name,
        props: {
          faculty: this.faculty,
          kafedra: this.kafedra,
          nomer_gruppy: this.nomer_gruppy,
          tip_zanyatiya: this.tip_zanyatiya,
        }
      }

      let res = await this.addTable(data);

      await $('#addTableModal').modal('toggle');

      await this.reloadPage();

      return;
    },

    async selectedType(e) {
      if (e.target.value == 1) {
        this.tip_zanyatiya = null;
        this.canBeSend = false;

        return;
      }

      let type = JSON.parse(e.target.value);

      this.tip_zanyatiya = type;

      return;
    },

    async openTable(tableId) {
      await this.$router.push({
        name: 'table',
        params: {
          id: tableId,
        },
      });
    },

    async deleteTable(tableId) {
      let data = {
        table_id: tableId,
        deleted: true,
      }

      await this.setTableColumnData(data);

      await this.reloadPage();
    },

    async openEditTable(table) {
      this.editTable = table;
      await this.$nextTick();
      await $('#editTableModal').modal('toggle');
      return;
    },
  }
}
</script>

<template>
  <div class="body relative">
    <div class="page-spinner" v-if="loading || sending">
      <a-spin tip="Загрузка...">
      </a-spin>
    </div>
    <div v-else class="container h-100 mt-0">

      <div class="row justify-content-center">

        <div @click="openAddTableModal" data-toggle="modal" data-target="#addTableModal" class="p-0 card border-none col-12 col-sm-6 col-md-5 col-xl-3 mt-3 justify-content-center align-items-center flex-column" style="width: 350px;">
          <div style="width: 250px; height: 320px;" class="d-flex position-relative card-body justify-content-center align-items-center">
            <div class="flex">
              <img class="140px" height="140px" src="/static/img/plus.png" alt="">
            </div>
          </div>
        </div>

        <div 
          v-for="table in tablesList" :key="table.table_id"
          class="p-0 m-0 card border-none col-12 col-sm-6 col-md-5 col-xl-3 mt-3 justify-content-center align-items-center flex-column" 
          style="width: 350px;">
          <div
          style="width: 250px; height: 320px;"
          class="card-body z2 position-relative"
          >
          <div class="card-body-menu">
              <a-popover trigger="click">
                <template slot="content">
                  <!-- <p>
                    <a-button type="link" @click="openEditTable(table)">Редактировать</a-button>
                  </p> -->
                  <p>
                    <a-button style="color: red" type="link" @click="deleteTable(table.table_id)">Удалить</a-button>
                  </p>
                </template>
                <svg class="focus-outline-none" xmlns="http://www.w3.org/2000/svg" height="30" width="30" viewBox="0 0 32 32">
                  <path d="M 16 6 C 14.895431 6 14 6.8954305 14 8 C 14 9.1045695 14.895431 10 16 10 C 17.104569 10 18 9.1045695 18 8 C 18 6.8954305 17.104569 6 16 6 z M 16 14 C 14.895431 14 14 14.895431 14 16 C 14 17.104569 14.895431 18 16 18 C 17.104569 18 18 17.104569 18 16 C 18 14.895431 17.104569 14 16 14 z M 16 22 C 14.895431 22 14 22.895431 14 24 C 14 25.104569 14.895431 26 16 26 C 17.104569 26 18 25.104569 18 24 C 18 22.895431 17.104569 22 16 22 z"/>
                </svg>
              </a-popover>
            </div>

            <a class="card-link" @click="openTable(table.table_id)"></a>

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

    <div class="modal fade" id="editTableModal" ref="modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalScrollableTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalScrollableTitle">Редактировать страницу</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body d-flex justify-content-center align-items-center flex-column">
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Зыкрыть</button>
            <button type="button" class="btn btn-primary">Редактировать</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="addTableModal" ref="modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalScrollableTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalScrollableTitle">Добавить страницу</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body d-flex justify-content-center align-items-center flex-column">
            <b-input
              placeholder="Название предмета"
              name="name"
              v-model="name"
              class="mb-3"
            ></b-input>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Занятие</label>
              </div>
              <select @change="selectedType" class="custom-select" id="inputGroupSelect01">
                <option value="1" selected>Выберите занятие</option>
                <option v-for="type in typeClassList" :key="type.id" :value="JSON.stringify(type)">{{type.value}}</option>
              </select>
            </div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Факультет</label>
              </div>
              <select @change="selectedFaculty" class="custom-select" id="inputGroupSelect01">
                <option value="1" selected>Выберите факультет</option>
                <option v-for="item in facultyList" :key="item.id" :value="JSON.stringify(item)">{{item.value}}</option>
              </select>
            </div>
             <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Кафедра</label>
              </div>
              <select @change="selectedKafedra" class="custom-select" id="inputGroupSelect01" :disabled="faculty == null">
                <option value="1" selected>Выберите кафедру</option>
                <option v-for="item in kafedraList" :key="item.id" :value="JSON.stringify(item)">{{item.value}}</option>
              </select>
            </div>
             <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Номер группы</label>
              </div>
              <select @change="selectedGroup" class="custom-select" id="inputGroupSelect01" :disabled="kafedra == null || faculty == null">
                <option value="1" selected>Выберите группу</option>
                <option v-for="item in groupList" :key="item.id" :value="JSON.stringify(item)">{{item.value}}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Зыкрыть</button>
            <button type="button" class="btn btn-primary" @click="addTableJournal" :disabled="!canBeSend || sending">Добавить</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
  
</style>
