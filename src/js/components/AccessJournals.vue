<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  data() {
    return {
      accessJournals: [],
      loading: true,
    }
  },

  computed: {
    ...mapState([
      'user',
    ])
  },

  async created() {
    if (!await this.checkUser()) {
      await this.$router.push({name: 'login'});

      return;
    }

    this.accessJournals = await this.getAccessJournals({user_id: this.user.user_id});

    await this.setPageTitle('Доступные журналы');
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
      'getAccessJournals',
      'getTablesList',
    ]),

    async openJournal(journalId) {
      await this.$router.push({
        name: 'access_journal',
        params: {
          id: journalId,
        },
      });
    }
  },
}
</script>

<template>
  <div class="body relative">
    <div class="page-spinner" v-if="(accessJournals.length == 0) && (!loading)">
      <div>
        Нет доступных журналов
      </div>
    </div>
    <div class="page-spinner" v-if="loading">
      <a-spin tip="Загрузка...">
      </a-spin>
    </div>
    <div v-else class="container h-100 mt-0">
      <div class="row">
        <div v-for="journal in accessJournals" :key="journal.journal_id" class="p-0 card border-none col-12 col-sm-6 col-md-5 col-xl-3 mt-3 justify-content-center align-items-center flex-column" style="width: 350px;">
          <div @click="openJournal(journal.journal_id)" style="width: 250px; height: 320px;" class="d-flex card-body justify-content-center align-items-center">
            <div class="flex flex-column justify-content-center align-items-center">
              <h3 class="text-center">Журнал</h3>
              <div class="card-body-item mt-5">
                <span>
                  Преподаватель:
                </span>
                <div>
                  {{ journal.owner.person }}
                </div>
              </div>
              <!-- <img class="140px" height="140px" src="/static/img/plus.png" alt=""> -->
            </div>
          </div>
        </div>
      </div>
    </div>
   </div>
</template>
