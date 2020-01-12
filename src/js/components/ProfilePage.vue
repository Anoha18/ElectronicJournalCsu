<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  data() {
    return {
      loading: true,
      searchValue: '',
      facultyList: null,
      faculty: null,
      kafedraList: null,
      kafedra: null,
      userList: null,
      selectedUsers: [],
      accessList: [],
      avatar: null,
    }
  },

  computed: {
    ...mapState([
      'user',
    ]),

    searchUserList() {
      return this.userList.filter((usr) => {
        if (usr.search_person.includes(this.searchValue.toLowerCase())) {
          return usr;
        }
      })
    },

    showAvatar() {
      return URL.createObjectURL(this.avatar);
    },
  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    this.accessList = await this.getAccessList({ object_id: this.user.journal_id });

    await this.setPageTitle('Профиль');
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
      'getUsersByProp',
      'addAccess',
      'getAccessList',
      'deleteAccessLink',
      'uploadFile',
      'updateUserAccount',
    ]),

    async openAddAccessJournal() {
      this.facultyList = await this.getProps({ brief: 'faculty' });
      await $('#addAccessJournal').modal('toggle');
    },

    async selectedFaculty(e) {
      if (e.target.value == 1) {
        this.faculty = null;
        this.kafedraList = null;
        this.userList = null;
        this.kafedra = null;

        return -1;
      }

      let faculty = JSON.parse(e.target.value);

      this.faculty = faculty;

      let res = await this.getPropsByParentId({parentId: faculty.id});


      if (res.length > 0) {
        this.kafedraList = res;

        return;
      }
      
      this.kafedraList = null;
      this.userList = await this.getUsersByProp({ faculty, object_id: this.user.journal_id });

      return;
    },

    async selectedKafedra(e) {
      if (e.target.value == 1) {
        this.kafedraList = null;
        this.userList = null;
        this.kafedra = null;

        return -1;
      }

      let kafedra = JSON.parse(e.target.value);

      this.kafedra = kafedra;

      this.userList = await this.getUsersByProp({...kafedra, ...{object_id: this.user.journal_id}});

      return;
    },

    async selectUsers(usr) {
      if (this.selectedUsers.includes(usr.user_id)) {
        this.selectedUsers.splice(this.selectedUsers.indexOf(usr.user_id), 1);

        return;
      }

      this.selectedUsers.push(usr.user_id);

      return;
    },

    async addAccessJournal() {
      if (this.selectedUsers.length == 0) {
        alert('Нет выбранных пользователей');
        
        return;
      }

      let data = {
        accessUsers: this.selectedUsers,
        object_id: this.user.journal_id,
        link_type_id: 1,
      }

      await this.addAccess(data);

      await $('#addAccessJournal').modal('toggle');

      await this.reloadPage();

      return;
    },

    async delAccess(userId) {
      let data = {
        user_id: userId,
        object_id: this.user.journal_id,
        link_type_id: 1,
      }

      await this.deleteAccessLink(data);

      await this.reloadPage();

      return;
    },

    clickInputFile() {
      document.getElementById('inputFile').click();
    },

    async saveChange() {
      this.loading = true;

      if (this.avatar) {
        await this.uploadFile({file: this.avatar, oid: this.user.user_id, ltid: 2, ftype: 'image'});
      }

      await this.updateUserAccount();

      await this.reloadPage();
    },

    changeInputFile(e) {
      e.preventDefault();
      e.stopPropagation();
      
      this.avatar = (e.target.files[0] || e.dataTransfer.files[0]);
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
    <div v-else class="container h-100 p-5 mb-5">
      <h2>Профиль</h2>
      <div class="row">
        <div class="col-12 col-sm-12 col-md-6 col-xl-6 d-flex justify-content-center align-items-center flex-column">
          <!-- <div class="user-avatar"> -->
            <!-- <img src="/static/img/user.png" alt=""> -->
            <a-avatar v-if="user.avatar_path && !avatar" @click="clickInputFile" :src="user.avatar_path + '?w=350'" class="d-flex object-fit-cover align-items-center justify-content-center user-avatar" :size="300"></a-avatar>
            <a-avatar v-else @click="clickInputFile" :src="avatar != null ? showAvatar : ''" class="d-flex object-fit-cover align-items-center justify-content-center user-avatar" :size="300" icon="user" />
            <!-- <a-avatar v-if="avatar != null" @click="clickInputFile" :src="showAvatar" class="d-flex align-items-center justify-content-center user-avatar" :size="300" icon="user" /> -->
            <label class="mt-3">Нажмите чтобы загрузить фотографию</label>
            <input @change="changeInputFile" style="display: none;" id="inputFile" type="file" accept="image/*">
          <!-- </div> -->
        </div>
        <div class="col-12 col-sm-12 col-md-6 col-xl-6 d-flex justify-content-center align-items-center flex-column">
          <ul class="w-100 list-group list-group-flush">
            <li class="list-group-item">
              <span class="list-group-item__label">
                Имя:
              </span>
              {{ user.name }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Фамилия:
              </span>
              {{ user.lastname }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Отчество:
              </span>
              {{ user.patronymic || '-' }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Электронная почта:
              </span>
              {{ user.email }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Логин:
              </span>
              {{ user.login }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Дата рождения:
              </span>
              {{ user.birthdate || '-' }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Адрес:
              </span>
              {{ user.address || '-' }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Факультет:
              </span>
              {{ user.props.faculty.val }}
            </li>
            <li class="list-group-item" v-if="user.props.kafedra">
              <span class="list-group-item__label">
                Кафедра:
              </span>
              {{ user.props.kafedra.val }}
            </li>
          </ul>
          <div class="w-100 d-flex align-items-start mt-3">
            <a-button @click="saveChange" type="primary" :disabled="loading">Сохранить изменения</a-button>
          </div>
        </div>
      </div>
      <h2 class="mt-4">Журнал</h2>
      <div class="row pl-5 pr-5 pt-2 pb-5">
        <div class="col-12 mb-2">
          <button type="button" class="btn btn-primary" @click="openAddAccessJournal">Добавить доступ</button>
        </div>
        <div class="col-12">
          <ul class="list-group list-group-flush">
            <li class="list-group-item" v-for="ac_user in accessList" :key="ac_user.user_id">
              <div class="d-flex justify-content-arround">
                <span class="mr-3 user-info d-flex">
                  <!-- <div class="user-avatar small mr-2 align-items-center">
                    <img src="/static/img/user.png" alt="">
                  </div> -->
                  <a-avatar v-if="ac_user.avatar_path != null" class="object-fit-cover mr-2 d-flex align-items-center justify-content-center" :size="30" :src="ac_user.avatar_path + '?w=40'" />
                  <a-avatar v-else class="mr-2 d-flex align-items-center justify-content-center" :size="30" icon="user" />
                  {{ ac_user.person }}
                </span>
                <span @click="delAccess(ac_user.user_id)" class="close-button">&times;</span>
              </div>
            </li>
          </ul>
          <!-- <button type="button" class="btn btn-danger">Удалить удалить</button> -->
        </div>
      </div>
    </div>




    <div class="modal fade" id="addAccessJournal" ref="modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalScrollableTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalScrollableTitle">Добавить доступ</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body d-flex justify-content-center align-items-center flex-column">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Факультет</label>
              </div>
              <select @change="selectedFaculty" class="custom-select" id="inputGroupSelect01">
                <option value="1" selected>Выберите факультет</option>
                <option v-for="item in facultyList" :key="item.id" :value="JSON.stringify(item)">{{item.value}}</option>
              </select>
            </div>
             <div v-if="kafedraList != null" class="input-group mb-2">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Кафедра</label>
              </div>
              <select @change="selectedKafedra" class="custom-select" id="inputGroupSelect01" :disabled="faculty == null">
                <option value="1" selected>Выберите кафедру</option>
                <option v-for="item in kafedraList" :key="item.id" :value="JSON.stringify(item)">{{item.value}}</option>
              </select>
            </div>
            <a-input-search class="mb-3" placeholder="Поиск пользователей" style="width: 100%" v-model="searchValue" />
            <div v-if="userList != null" class="input-group mb-2">
              <ul class="w-100 list-group list-group-flush">
                <li v-for="usr in searchUserList" :key="usr.user_id" v-if="(usr.user_id != user.user_id)" class="list-group-item">
                  <div class="d-flex justify-content-between">
                    <span>
                      {{ usr.person }}
                    </span>
                    <a-checkbox :checked="selectedUsers.includes(usr.user_id)" @change="selectUsers(usr)"></a-checkbox>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
            <button type="button" class="btn btn-primary" @click="addAccessJournal">Выбрать</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .user-avatar:hover {
    cursor: pointer;
  }
  .user-info {
    font-size: 22px
  }
  .small {
    width: 30px;
    height: 30px;
  }
  .close-button:hover {
    cursor: pointer;
  }
</style>
