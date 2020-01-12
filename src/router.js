import Vue from 'vue';
import VueRouter from 'vue-router';

import LoginPage from './js/components/LoginPage.vue';
import RegistrationPage from './js/components/RegistrationPage.vue';
import JournalPage from './js/components/JournalPage.vue';
import TabePage from './js/components/TablePage.vue';
import AccessJournals from './js/components/AccessJournals.vue';
import ProfilePage from './js/components/ProfilePage.vue';
import AccessJournalView from './js/components/AccessJournalView.vue';
import DeanJournalsPage from './js/components/dean/DeanJournalsPage.vue';
import DeanReportPage from './js/components/dean/DeanReportPage.vue';
import StudentReport from './js/components/dean/StudentReportPage.vue';
import AdminAddStudent from './js/components/admin/AddStudent.vue';
import ChatListPage from './js/components/ChatListPage.vue';
import ChatPage from './js/components/ChatPage.vue';
import UserPage from './js/components/UserPage.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { path: '/', name: 'home', component: JournalPage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/registration', name: 'registration', component: RegistrationPage },
    { path: '/table/:id', name: 'table', component: TabePage, props: true },
    { path: '/access_journals/', name: 'access_journals', component: AccessJournals },
    { path: '/profile/', name: 'profile', component: ProfilePage },
    { path: '/access_journal/:id', name: 'access_journal', component: AccessJournalView, props: true },
    { path: '/dean/journals/', name: 'dean.journals', component: DeanJournalsPage },
    { path: '/dean/reports/', name: 'dean.reports', component: DeanReportPage },
    { path: '/dean/report/student/:id', name: 'dean.report.student', component: StudentReport, props: true },
    { path: '/admin/insert/student/', name: 'admin.insert.user', component: AdminAddStudent },
    { path: '/chats', name: 'chats', component: ChatListPage },
    { path: '/chat/:id', name: 'chat', component: ChatPage, props: true },
    { path: '/user/:id', name: 'user_page', component: UserPage, props: true },
  ],
});

export default router;
