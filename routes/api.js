const router = require('express').Router();
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './static/uploads');
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({storage: storage});


const file = require('../controllers/file.js');
const user = require('../controllers/user');
const journal = require('../controllers/journal.js');
const prop = require('../controllers/prop.js');
const table = require('../controllers/table.js');
const item = require('../controllers/item.js');
const dean = require('../controllers/dean.js');
const student = require('../controllers/student.js');
const admin = require('../controllers/admin.js');
const message = require('../controllers/message.js');
const chat = require('../controllers/chat');

// Главная страница
router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './../static/index.html'));
});

// получение журналов деканата
router.post('/dean/getJournals', dean.getJournals);

// Регистрация пользователя
router.post('/registration', user.registration);

// авторизация пользователя
router.post('/login', user.login);

// проверка, авторизован ли пользователь?
router.post('/checkUser', user.checkUser);

// выход из аккаунта профиля
router.post('/logout', user.logout);

// получение листа с пропсами по брифу
router.post('/getPropsList', prop.getPropsList);

// получение пропсов по родительсокму id
router.post('/getPropsByParentId', prop.getPropsByParentId);

// добавление таблицы в журнал
router.post('/addTable', table.addTable);

// получение всех таблиц журнала
router.post('/getTablesList', table.getTablesList);

// получение таблицы по id
router.post('/getTable', table.getTable);

// сохранение item
router.post('/saveItem', item.saveItem);

// получение всех занятий по id таблицы
router.post('/getClassesByTableId', item.getClassesByTableId);

// изменение значений столбцов таблицы
router.post('/setTableColumnData', table.setTableColumnData);

// получние пользователей по prop
router.post('/getUsersByProp', user.getUsersByProp);

// добавление ссылок users
router.post('/addAccess', user.addAccess);

// получение доступов по object_id
router.post('/getAccessList', user.getAccessList);

// удаление link
router.post('/deleteAccessLink', user.deleteAccessLink);

// получение доступных журналов
router.post('/getAccessJournals', journal.getAccessJournals);

// получние студентов группы
router.post('/getStudentsByGroup', student.getStudentsByGroup);

// получение студента по id
router.post('/getStudentById', student.getStudentById);

// добавление студента
router.post('/admin/addStudent', admin.addStudent);

// получение всех предметов студента
router.post('/getTablesByStudent', table.getTablesByStudent);

// получение общей информации по посещению судента
router.post('/getInfoByStudent', item.getInfoByStudent);

// загрузка файлов
router.post('/upload/file', multer({ storage }).single('file'), file.uploadFile);

// обновить данные пользователя
router.post('/updateUserAccount', user.updateUserAccount);

// изменить значение столбца студента
router.post('/setStudentColumn', student.setStudentColumn);

// получение студентов пол id таблицы
router.post('/getStudentsByTableId', student.getStudentsByTableId);

// получение пользователя по id
router.post('/getUserById', user.getUserById);

// добавление сообщения
router.post('/addMessage', message.addMessage);

// получение списка чатов
router.post('/getChatList', chat.getChatList);

// получение чата
router.post('/getChat', chat.getChat);

module.exports = router;
