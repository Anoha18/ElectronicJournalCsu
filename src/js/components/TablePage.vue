<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import ru_RU from 'ant-design-vue/lib/date-picker/locale/ru_RU.js';

export default {
  props: {
    id: {
      required: true,
    },
  },
  data() {
    return {
      ru_RU,
      studentsList: [],
      addColumn: false,
      addDataClass: {
        date: null,
        desc: null,
        dateFormated: null,
      },
      cellPopoverInfo: {
        _class: null,
        student: null,
        onClass: {
          item_id: null,
          bool_val: null,
          description: null,
        },
        mark: {
          int_val: null,
          description: null,
        },
        zametka: {
          item_id: null,
          description: null,
        },
      },
      changeMarkStudent: {
        student: null,
        mark: {
          item_id: null,
          int_val: null,
          description: null,
        },
      },
      onClass: [],
      currentStudent: null,
      changedStudentMark: [],
      changedStudent: [],
      allStudentId: [],
      classes: [],
      send: false,
      loading: true,
      changedDescription: null,
      sendChange: false,
      studentPopover: {
        student_id: null,
        changedDescr: false,
      },
    };
  },

  computed: {
    ...mapState([
      'table',
      'user',
    ]),

  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    await this.getTable({tableId: +this.id});


    await this.init();
    // if (this.table.students != null) {
    //   this.allStudentId = await this.table.students.map((student) => {
    //     return student.student_id;
    //   });
    // } 

    await this.setPageTitle(this.table.name);
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
      'getTable',
      'saveItem',
      'getClassesByTableId',
      'setStudentColumn',
      'getStudentsByTableId',
    ]),

    async init() {
      this.studentsList = await this.getStudentsByTableId(+this.id);
      this.classes = await this.getClassesByTableId(+this.id);
    },

    async AddDateColumn() {
      this.send = true;
      if (this.addDataClass.date == null || this.addDataClass.date == '') {
        this.send = false;
        return alert('Выберите дату занятия');
      }

      let data = {
        owner_id: this.user.user_id,
        type_id: 3,
        columnDate: this.addDataClass.date,
        description: this.addDataClass.desc,
        table_id: this.table.table_id,
      }

      let res = await this.saveItem(data);

      await this.$nextTick();
      await this.init();
      this.send = false;
      return document.getElementById('dateAddButton').click();
    },

    changeDate(value, dateString) {
      this.addDataClass.dateFormated = dateString;
    },

    async addPresence(e) {
      let student = JSON.parse(e.target.value);
      if (this.onClass.includes(student.student_id)) {
        this.onClass.splice(this.onClass.indexOf(student.student_id), 1);

        return;
      }

      this.onClass.push(student.student_id);

      return;
    },

    openEditDescriptionStudent(student) {
      if (this.currentStudent) {
        if (this.currentStudent.student_id != student.student_id) {
          this.changedDescription = null;
        }
      }

      this.currentStudent = student;
      this.studentPopover.changedDescr = false;
      this.changedDescription = student.description || null;
    },

    async changeDescrStudent() {
      this.sendChange = true;

      const data = {
        studentId: this.currentStudent.student_id,
        columnName: 'description',
        columnValue: this.changedDescription,
      };

      let result = await this.setStudentColumn(data);

      await this.getTable({tableId: +this.id});

      // this.changedDescription = null;
      this.studentPopover.changedDescr = false;

      this.sendChange = false;
    },

    formatStudentDescription(description) {
      if (!description) return;

      if (description == null) return;

      return description.replace(/\n/g, '<br>');
    },

    async openTableCell(student, _class) {
      if (!_class || !student) return;

      this.cellPopoverInfo.onClass.item_id = null;
      this.cellPopoverInfo.onClass.bool_val = null;
      this.cellPopoverInfo.onClass.description = null;
      this.cellPopoverInfo.student = student;
      this.cellPopoverInfo._class = _class;
      this.cellPopoverInfo.mark.int_val = null;
      this.cellPopoverInfo.mark.description = null;
      this.cellPopoverInfo.zametka.item_id = null;
      this.cellPopoverInfo.zametka.description = null;

      if (Array.isArray(_class.students_on_class)) {
        await _class.students_on_class.map((onClassMark) => {
          if (onClassMark.student_id == student.student_id) {
            this.cellPopoverInfo.onClass.item_id = onClassMark.item_id;
            this.cellPopoverInfo.onClass.description = onClassMark.description;
            this.cellPopoverInfo.onClass.bool_val = onClassMark.bool_val;
          }
        });
      }

      if (Array.isArray(_class.students_zametki)) {
        await _class.students_zametki.map((zametka) => {
          if (zametka.student_id == student.student_id) {
            this.cellPopoverInfo.zametka.item_id = zametka.item_id;
            this.cellPopoverInfo.zametka.description = zametka.description;
          }
        });
      }
    },

    async saveCellOnClassInfo() {
      this.send = true;
      
      await this.$nextTick();

      if (this.cellPopoverInfo.onClass.item_id) {
        await this.saveItem(this.cellPopoverInfo.onClass);
      } else {
        const data = {
          owner_id: +this.user.user_id,
          type_id: 2,
          student_id: +this.cellPopoverInfo.student.student_id,
          parent_id: +this.cellPopoverInfo._class.item_id,
          table_id: +this.table.table_id,
          bool_val: this.cellPopoverInfo.onClass.bool_val,
          date_val: this.cellPopoverInfo._class.date_val,
          description: this.cellPopoverInfo.onClass.description,
        };

        await this.saveItem(data);
      }

      await this.init();
      this.send = false;
    },

    async saveCellMark() {
      this.send = true;

      await this.$nextTick();

      if (this.cellPopoverInfo.mark.int_val == null) return;

      const data = {
        owner_id: +this.user.user_id,
        type_id: 1,
        student_id: +this.cellPopoverInfo.student.student_id,
        parent_id: +this.cellPopoverInfo._class.item_id,
        table_id: +this.table.table_id,
        int_val: +this.cellPopoverInfo.mark.int_val,
        date_val: this.cellPopoverInfo._class.date_val,
        description: this.cellPopoverInfo.mark.description,
      }

      await this.saveItem(data);

      this.cellPopoverInfo.mark.int_val = null;
      this.cellPopoverInfo.mark.description = null;
      await this.init();
      this.send = false;
    },

    async saveCellZametka() {
      this.send = true;

      if (this.cellPopoverInfo.zametka.item_id) {
        await this.saveItem(this.cellPopoverInfo.zametka);
      } else {
        const data = {
          owner_id: +this.user.user_id,
          type_id: 4,
          student_id: +this.cellPopoverInfo.student.student_id,
          parent_id: +this.cellPopoverInfo._class.item_id,
          table_id: +this.table.table_id,
          date_val: this.cellPopoverInfo._class.date_val,
          description: this.cellPopoverInfo.zametka.description,
        }
  
        await this.saveItem(data);
      }

      await this.init();
      this.send = false;
    },

    async changeMark(mark, student) {
      this.changeMarkStudent.student = student;
      this.changeMarkStudent.mark.item_id = mark.item_id;
      this.changeMarkStudent.mark.int_val = mark.int_val;
      this.changeMarkStudent.mark.description = mark.description;
    },

    async changedMark() {
      this.send = true;

      const data = {
        item_id: this.changeMarkStudent.mark.item_id,
        int_val: +this.changeMarkStudent.mark.int_val,
        description: this.changeMarkStudent.mark.description,
        owner_id: +this.user.user_id,
      };

      await this.saveItem(data);

      await this.init();

      this.send = false;
    },

    async deletedMark() {
      this.send = true;

      const data = {
        item_id: this.changeMarkStudent.mark.item_id,
        deleted: true,
      };

      await this.saveItem(data);

      await this.init();

      this.send = false;
      await document.getElementById('pageBody').click();
    },

    async showUser(userId) {
      await this.$router.push({
        name: 'user_page',
        params: {
          id: userId,
        }
      })
    }
  }
}
</script>

<template>
  <div class="body relative">
    <div class="page-spinner" v-if="studentsList == null">
      <div>
        Нет студентов
      </div>
    </div>
    <div class="page-spinner" v-if="loading">
      <a-spin tip="Загрузка...">
      </a-spin>
    </div>
    <div v-else>
      <!-- <button v-if="table && table.students != null" @click="saveTableChange" :disabled="send" type="button" class="btn btn-primary fixed-right btn-table-save mr-5 mb-4">
        Сохранить таблицу
      </button> -->
      <div class="p-5" id="pageBody" v-if="studentsList != null">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th scope="col" style="width: 5%">#</th>
              <th class="align-middle" scope="col" style="width: 30%">Имя Фамилия</th>
              <th scope="col" style="width: 15%" class="item_table" v-for="_class in classes" :key="_class.item_id">
                <div class="d-flex align-items-center flex-column">
                  <a-popover  trigger="hover">
                    <!-- :title="'Преподователь: ' + mark.person" -->
                    <template  slot="title">
                      <div class="popover-title">
                        <span class="popover-label mr-2 mb-2">
                          Преподаватель:
                        </span>
                        <div class="ml-2 d-flex">
                          <div @click="showUser(_class.owner.user_id)" class="user-link d-flex popover-text">
                            <a-avatar v-if="_class.owner.avatar_path != null" :size="20" class="mr-2 d-flex align-items-center justify-content-center object-fit-cover" :src="_class.owner.avatar_path + '?=30'" />
                            <a-avatar class="mr-2 d-flex align-items-center justify-content-center" v-else :size="20" icon="user" />
                            {{  _class.owner.person }}
                          </div>
                        </div>
                      </div>
                    </template>
                    <template slot="content">
                      <span class="popover-label">Описание: </span>
                      <p class="ml-2 popover-text">{{  _class.description || '-'}}</p>
                    </template>
                    <a-button>{{ _class.date_val_format }}</a-button>
                  </a-popover>
                </div>
              </th>
              <th scope="col" class="item_table align-middle" style="width: 5%;">
                <div class="d-flex align-items-center flex-column">
                  <a-popover  title="Дата занятия" trigger="click">
                    <template slot="content" style="width: 150px;">
                      <a-date-picker placeholder="" v-model="addDataClass.date" @change="changeDate" :locale="ru_RU" class="mb-3 w-100" ref="newClassDatePicker" style="min-width: 50px;" :format="'DD.MM.YYYY'" />
                      <textarea v-model="addDataClass.desc" type="text" class="ant-input mb-4" style="height: 100px; width: 100%;"></textarea>
                      <a-button type="primary" @click="AddDateColumn" class="mr-2" :disabled="send">Записать</a-button>
                    </template>
                    <a-button id="dateAddButton">
                      <img v-if="!addColumn" height="20px" width="20px" src="/static/img/plus.png" alt="">
                      <span v-else> {{ addDataClass.dateFormated }} </span>
                    </a-button>
                  </a-popover>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in studentsList" :key="student.student_id">
              <th scope="row">{{index + 1}}</th>
              <td>
                <div class="d-flex align-items-center justify-content-between">
                  <span>
                    {{student.person}}
                  </span>
                  <div class="ml-3 d-flex">
                    <a-popover title="Информация" trigger="click">
                      <template slot="content" style="width: 150px;">
                        <div class="d-flex justify-content-between" v-if="!studentPopover.changedDescr">
                          <p v-html="formatStudentDescription(student.description)" class="popover-text"></p>
                          <a-icon @click="studentPopover.changedDescr = true" height="20px" width="20px" type="edit" />
                        </div>
                        <textarea v-else v-model="changedDescription" :ref="`student-description-${student.student_id}`" type="text" class="ant-input mb-4" style="height: 100px; width: 100%;"></textarea>
                        <a-button v-if="studentPopover.changedDescr" type="primary" @click="changeDescrStudent" class="mr-2" :disabled="sendChange">Записать</a-button>
                      </template>
                      <a-icon @click="openEditDescriptionStudent(student)" height="20px" width="20px" type="form"/>
                    </a-popover>
                  </div>
                </div>
              </td>
              <td class="item_table align-middle position-relative" v-for="_class in classes" :key="_class.item_id">
                <div class="d-flex justify-content-start">
                  <a-popover trigger="click">
                    <template slot="content">
                      <a-tabs defaultActiveKey="1" type="card" size="small">
                        <a-tab-pane tab="Посещение" key="1">
                          <div class="p-3">
                            <a-radio-group v-model="cellPopoverInfo.onClass.bool_val">
                              <a-radio :value="true">Присутствовал</a-radio>
                              <br>
                              <a-radio :value="false">Отсутствовал</a-radio>
                            </a-radio-group>
                            <div class="mt-2 mb-1">Описание</div>
                            <textarea v-model="cellPopoverInfo.onClass.description" type="text" class="ant-input w-100 h-100"></textarea>
                            <a-button class="mt-2" type="primary" @click="saveCellOnClassInfo" :disabled="send">Сохранить</a-button>
                          </div>
                        </a-tab-pane>
                        <a-tab-pane tab="Оценка" key="2" forceRender>
                          <div class="p-3">
                            <div class="d-flex mb-3 align-content-center">
                              <span class="mr-2">Оценка:</span>
                              <input v-model="cellPopoverInfo.mark.int_val" v-mask="'#'" type="text" class="ant-input" style="width: 100%;">
                            </div>
                            <div>Описание:</div>
                            <textarea v-model="cellPopoverInfo.mark.description" type="text" class="ant-input" style="height: 100px; width: 100%;"></textarea>
                            <a-button type="primary" class="mt-2" @click="saveCellMark" :disabled="send">Добавить</a-button>
                          </div>
                        </a-tab-pane>
                        <a-tab-pane tab="Заметка" key="3" forceRender>
                          <div class="p-3">
                            <div>Описание:</div>
                            <textarea v-model="cellPopoverInfo.zametka.description" type="text" class="ant-input" style="height: 100px; width: 100%;"></textarea>
                            <a-button type="primary" class="mt-2" @click="saveCellZametka" :disabled="send">Записать</a-button>
                          </div>
                        </a-tab-pane>
                      </a-tabs>
                    </template>
                    <a @click="openTableCell(student, _class)" class="card-link"></a>
                  </a-popover>
                  <div class="d-flex align-items-center flex-column mr-2" v-for="studentOnClass in _class.students_on_class" :key="studentOnClass.item_id" v-if="studentOnClass.student_id == student.student_id">
                    <a-popover trigger="hover">
                      <template  slot="title">
                        <div class="popover-title">
                          <span class="popover-label mr-2 mb-2">
                            Преподаватель:
                          </span>
                          <div class="ml-2 d-flex">
                            <div @click="showUser(studentOnClass.owner.user_id)" class="user-link d-flex popover-text">
                              <a-avatar class="mr-2 d-flex align-items-center justify-content-center object-fit-cover" v-if="studentOnClass.owner.avatar_path != null" :size="20" :src="studentOnClass.owner.avatar_path + '?w=30'" />
                              <a-avatar class="mr-2 d-flex align-items-center justify-content-center" v-else :size="20" icon="user" />
                              {{ studentOnClass.person }}
                            </div>
                          </div>
                        </div>
                      </template>
                      <template slot="content">
                        <span class="popover-label">Описание: </span>
                        <p class="ml-2 popover-text">{{ studentOnClass.description || '-'}}</p>
                      </template>
                      <div class="z100">
                        {{ (studentOnClass.bool_val) ? '' : 'Н' }}
                      </div>
                    </a-popover>
                  </div>
                  <div class="d-flex align-items-center flex-column align-middle" v-for="mark in _class.students_marks" :key="mark.item_id" v-if="mark.student_id == student.student_id">
                    <a-popover  trigger="hover">
                      <!-- :title="'Преподователь: ' + mark.person" -->
                      <template  slot="title">
                        <div class="popover-title">
                          <span class="popover-label mr-2 mb-2">
                            Преподаватель:
                          </span>
                          <div class="ml-2 d-flex">
                            <div @click="showUser(mark.owner.user_id)" class="user-link d-flex popover-text">
                              <a-avatar class="mr-2 d-flex align-items-center justify-content-center object-fit-cover" v-if="mark.owner.avatar_path != null" :size="20" :src="mark.owner.avatar_path + '?w=30'" />
                              <a-avatar class="mr-2 d-flex align-items-center justify-content-center" v-else :size="20" icon="user" />
                              {{ mark.person }}
                            </div>
                          </div>
                        </div>
                      </template>
                      <template slot="content">
                        <span class="popover-label">Описание: </span>
                        <p class="ml-2 popover-text">{{ mark.description || '-'}}</p>
                      </template>
                      <a-popover trigger="click">
                        <template slot="title">
                          <span>Изменить оценку</span>
                        </template>
                        <template slot="content">
                          <div class="p-3">
                            <div class="d-flex mb-3 align-content-center">
                              <span class="mr-2">Оценка:</span>
                              <input v-model="changeMarkStudent.mark.int_val" v-mask="'#'" type="text" class="ant-input" style="width: 100%;">
                            </div>
                            <div>Описание:</div>
                            <textarea v-model="changeMarkStudent.mark.description" type="text" class="ant-input" style="height: 100px; width: 100%;"></textarea>
                            <div class="d-flex mt-2">
                              <button type="button" class="btn btn-primary mr-2" @click="changedMark" :disabled="send">Изменить</button>
                              <button type="button" class="btn btn-danger" @click="deletedMark" :disabled="send">Удалить</button>
                            </div>
                          </div>
                        </template>
                        <div class="z100 ml-1" @click="changeMark(mark, student)">{{ mark.int_val }}</div>
                      </a-popover>
                    </a-popover>
                  </div>
                  <a-popover  v-for="zametka in _class.students_zametki" :key="zametka.item_id" v-if="zametka.student_id == student.student_id"  trigger="hover">
                    <!-- :title="'Преподователь: ' + mark.person" -->
                    <template  slot="title">
                      <div class="popover-title">
                        <span class="popover-label mr-2 mb-2">
                          Преподаватель:
                        </span>
                        <div class="ml-2 d-flex">
                          <div @click="showUser(zametka.owner.user_id)" class="user-link d-flex popover-text">
                            <a-avatar class="mr-2 d-flex align-items-center justify-content-center object-fit-cover" v-if="zametka.owner.avatar_path != null" :size="20" :src="zametka.owner.avatar_path + '?w=30'" />
                            <a-avatar class="mr-2 d-flex align-items-center justify-content-center" v-else :size="20" icon="user" />
                            {{ zametka.person }}
                          </div>
                        </div>
                      </div>
                    </template>
                    <template slot="content">
                      <span class="popover-label">Заметка: </span>
                      <p v-html="formatStudentDescription(zametka.description)" class="ml-2 popover-text"></p>
                    </template>
                    <div class="position-absolute z100 cell-pushpin">
                      <a-icon type="pushpin" />
                    </div>
                  </a-popover>
                  
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style >
  .item_table:hover {
    background: rgba(0, 0, 0, 0.1);
    cursor: pointer;
    box-shadow: 0 0 1px rgba(0,0,0,0.1);
  }
  .table_input {
    border: 1px solid rgba(0,0,0,0.1);
    width: 100%;
  }
  .ant-popover {
    width: 400px !important;
  }
  .fixed-right {
    position: fixed;
    bottom: 0;
    right: 0;
  }
  .btn-table-save {
    
  }
  .popover-title {
    font-size: 13px !important;
  }
  .popover-label {
    color: gray;
  }
  .popover-text {
    overflow: visible;
    white-space: inherit;
    word-wrap: break-word;
  }
  .page-spinner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    background: rgba(255, 255, 255, 0.5);
    z-index: 50;
  }
  .cell-pushpin {
    bottom: 5px;
    right: 5px;
  }
</style>
