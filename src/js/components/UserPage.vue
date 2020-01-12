<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import NewMessageModal from './NewMessageModal.vue';

export default {
  name: 'user-page',
  props: {
    id: {
      required: true,
    },
  },
  components: {
    NewMessageModal,
  },
  data() {
    return {
      loading: true,
      viewUser: null,
      modalAddNewMessageOpened: false,
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

    this.viewUser = await this.getUserById(+this.id);

    await this.setPageTitle(this.viewUser.person);
    await this.setPageNavbar(true);

    this.loading = false;
  },

  methods: {
    ...mapActions([
      'checkUser',
      'getUserById',
    ]),
    ...mapMutations([
      'setPageNavbar',
      'reloadPage',
      'setPageTitle',
    ])
  },
}
</script>

<template>
  <div class="body relative">
    <div class="page-spinner" v-if="loading">
      <a-spin tip="Загрузка...">
      </a-spin>
    </div>
    <div v-else class="container h-100 p-5">
      <h2>Профиль</h2>
      <div class="row">
        <div class="col-12 col-sm-12 col-md-6 col-xl-6 d-flex justify-content-center align-items-center flex-column">
          <a-avatar v-if="viewUser.avatar_path" :src="viewUser.avatar_path + '?w=350'" class="d-flex object-fit-cover align-items-center justify-content-center" :size="300"></a-avatar>
          <a-avatar v-else class="d-flex object-fit-cover align-items-center justify-content-center" :size="300" icon="user" />
        </div>
        <div class="col-12 col-sm-12 col-md-6 col-xl-6 d-flex justify-content-center align-items-center flex-column">
          <ul class="w-100 list-group list-group-flush">
            <li class="list-group-item">
              <span class="list-group-item__label">
                Имя:
              </span>
              {{ viewUser.name }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Фамилия:
              </span>
              {{ viewUser.lastname }}
            </li>
            <li class="list-group-item">
              <span class="list-group-item__label">
                Отчество:
              </span>
              {{ viewUser.patronymic || '-' }}
            </li>
            <!-- <li class="list-group-item">
              <span class="list-group-item__label">
                Электронная почта:
              </span>
              {{ viewUser.email }}
            </li> -->
            <!-- <li class="list-group-item">
              <span class="list-group-item__label">
                Логин:
              </span>
              {{ viewUser.login }}
            </li> -->
            <!-- <li class="list-group-item">
              <span class="list-group-item__label">
                Дата рождения:
              </span>
              {{ viewUser.birthdate || '-' }}
            </li> -->
            <!-- <li class="list-group-item">
              <span class="list-group-item__label">
                Адрес:
              </span>
              {{ viewUser.address || '-' }}
            </li> -->
            <li class="list-group-item">
              <span class="list-group-item__label">
                Факультет:
              </span>
              {{ viewUser.props.faculty.val }}
            </li>
            <li class="list-group-item" v-if="viewUser.props.kafedra">
              <span class="list-group-item__label">
                Кафедра:
              </span>
              {{ viewUser.props.kafedra.val }}
            </li>
          </ul>
        </div>
      </div>
      <div class="row mt-5 mb-5">
        <div class="col-12 col-sm-12 col-md-6 col-xl-6">
          <new-message-modal
            :objectUser="viewUser"
          ></new-message-modal>
        </div>
      </div>
    </div>
  </div>
</template>
