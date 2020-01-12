// const crypto = require('crypto');
const db = require('../db/index.js');
const UserModel = require('../models/user/UserModel.js');
const JournalModel = require('../models/journal/JournalModel.js');
const LinkUserModel = require('../models/LinkUserModel.js')

require('debug');

// регистрация пользователя
module.exports = {

  // регистрация пользователя
  async registration(req, res) {
    if (!req.body 
      || !req.body.login 
      || !req.body.password
      || !req.body.name
      || !req.body.lastname
      || !req.body.email) return res.json({error: 'Not all data delivered'});

    let model = new UserModel()
      .filter('login').eq(`${req.body.login}`)
      .filter('deleted').eq('false');
    let result, isLogin, isEmail;
    
    try {
      [isLogin] = await model.commit();
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }

    if (isLogin) {
      return res.json({error: 'Пользователь с таким логином уже существует'});
    }

    model.clear();

    try {
      [isEmail] = await model
        .filter('email').eq(`${req.body.email}`)
        .filter('deleted').eq('false')
        .commit();
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }

    if (isEmail) {
      return res.json({error: 'Пользователь с такой почтой уже существует'});
    }
    
    let phone = req.body.phone;

    if (phone) {
      if (phone[0] == '+') {
        phone = phone.replace(/[()\s-]/g, '');
        
        // Проверка (номер телефона с 8...)
        if (!phone.match(/@/g) && phone[0] === '8') {
          phone = phone.replace('8','+7');
        }
      }
    }

    try {
      await db.sql(`
        insert into t_user
        ("login", "password", "email", "name", "lastname", "phone")
        values ('${req.body.login}', md5('${req.body.password}'), 
          '${req.body.email}', '${req.body.name}', '${req.body.lastname}', '${phone}');
      `);
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }

    model.clear();

    try {
      [result] = await model.filter('login').eq(`${req.body.login}`).commit();
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }

    await Promise.all(Object.keys(req.body.props).map(async (key) => {
      let prop = req.body.props[key];

      if (!prop || prop == null) return;

      if (prop.prop_value_id || prop.value) {
        prop.user_id = result.user_id;

        if (!prop.prop_id) {
          let error = 'prop_id is not defined!';

          console.stack(error);

          return {error};
        }

        await UserModel.saveProp(prop);
      }
    }));

    let journal = new JournalModel();

    let record = {
      owner_id: result.user_id,
    };

    try {
      await journal.insert(record);
    } catch (e) {
      console.error(e);
  
      return res.json({ error: e.message });
    }
  
    return res.json({ result });
  },
  
  // авторизация пользователя
  async login(req, res) {
    if (!req.body || !req.body.login || !req.body.password) {
      return res.json({error: 'Not all data delivered'});
    }
  
    let isUser;
  
    try {
      isUser = await db.sql(`
        select 
          tu.login, tu.password, email
        from t_user tu
        where 1=1
        and password = md5('${req.body.password}') 
        and login = '${req.body.login}'
        and deleted = false
      `);
    } catch (e) {
      console.error(e.message);
  
      return res.json({error: e.message});
    }
  
    if (!isUser) {
      return res.json({error: 'Пользователь не найден'});
    }
  
    let model = new UserModel().filter('login').eq(`${req.body.login}`);
  
    let result;
  
    try {
      [result] = await model.commit();
    } catch (error) {
      console.error(error);
  
      return res.json({error: error.message});
    }

    req.session.user = result;

    let journalModel = new JournalModel().filter('owner_id').eq(result.user_id);

    try {
      [result] = await journalModel.commit();
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }
  
    req.session.user.journal_id = result.journal_id;
    req.session.user.journal = result;

    return res.json({result: req.session.user});
  },
  
  async checkUser(req, res) {
    if (req.session.user) {
      return res.json({result: req.session.user});
    }
  
    return res.json({error: 'User not found'});
  },
  
  async logout(req, res) {
    if (req.session && req.sessionID) {
      await req.session.regenerate(await function (err) {
        console.log('Session regenerate');
      });
    }
  
    return res.send(true);
  },

  async getUsersByProp(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.prop_id || !req.body.prop_value_id) {
      return res.json({ error: 'Not all data delivered' });
    }

    let user = req.session.user;
    let model = new UserModel();
    let result;

    model.filter().raw(`
      exists(select 1
        from t_user_prop tup
        where tup.user_id = t.user_id
        and tup.user_id != ${user.user_id}
        and tup.prop_id = ${req.body.prop_id}
        and tup.prop_value_id = ${req.body.prop_value_id}
        and deleted = false
        and not exists (select 1 from t_user_link tul, t_link_type tlt
          where 1=1
          and tul.user_id = t.user_id
          and tul.object_id = ${req.body.object_id}
          and tlt.link_type_id = tul.link_type_id
          and tlt.brief = ''dostyp'')
      )
    `);

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e);

      return res.json({error: e.message});
    }

    return res.json({ result });
  },

  async addAccess(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!Array.isArray(req.body.accessUsers) || !req.body.object_id) {
      return res.json({ error: 'Not all data delivered' });
    }

    let result = await Promise.all(req.body.accessUsers.map(async (user) => {
      let model = new LinkUserModel();
      let instance;
      model.filter('user_id').eq(user)
        .filter('link_type_id').eq(req.body.link_type_id)
        .filter('object_id').eq(req.body.object_id);

      try {
        [instance] = await model.commit();
      } catch (e) {
        console.error(e.message);

        return {error: e.message};
      }

      if (instance) {
        return;
      }

      let record = {
        user_id: user,
        object_id: req.body.object_id,
        link_type_id: req.body.link_type_id || null,
      }

      try {
        await db.sql(`
          insert into t_user_link ("user_id", "link_type_id", "object_id") values (${record.user_id}, ${record.link_type_id}, ${record.object_id})
        `)
      } catch (e) {
        console.error(e);

        return {error: e.message};
      }
    }));

    return res.json({ result });
  },

  async getAccessList(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.object_id) {
      return res.json({ error: 'Object Id not found' });
    }

    let result;
    let model = new UserModel();

    model.filter().raw(`
      exists (select 1 from t_user_link tul, t_link_type tlt
        where 1=1
        and tul.user_id = t.user_id
        and tul.object_id = ${req.body.object_id}
        and tlt.link_type_id = tul.link_type_id
        and tlt.brief = ''dostyp''
      )
    `)

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e);

      return res.json({error: e.message});
    }

    return res.json({ result });
  },

  async deleteAccessLink(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.user_id || !req.body.object_id) {
      return res.json({ error: 'Not all data delivered' });
    }

    let model = new LinkUserModel();
    model.filter('user_id').eq(req.body.user_id)
      .filter('object_id').eq(req.body.object_id);

    if (req.body.link_type_id) model.filter('link_type_id').eq(req.body.link_type_id);
    
    let row;
    
    try {
      [row] = await model.commit();
    } catch (e) {
      console.error(e);

      return res.json({error: e.message});
    }

    if (!row) {
      return res.json({error: 'Link not found'});
    }

    await model.clear();

    try {
      [row] = await model.remove(row.user_link_id);
    } catch (e) {
      console.error(e);

      return res.json({error: e.message});
    }

    return res.json({ result: row });
  },

  async updateUserAccount(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (req.body.user_id) {

    }

    let result;

    const model = new UserModel().filter('user_id').eq(req.session.user.user_id);

    try {
      [result] = await model.commit();
    } catch (error) {
      console.error(error);
  
      return res.json({error: error.message});
    }

    req.session.user = result;

    let journalModel = new JournalModel().filter('owner_id').eq(result.user_id);

    try {
      [result] = await journalModel.commit();
    } catch (e) {
      console.error(e);

      return res.json({error: e.message});
    }

    req.session.user.journal_id = result.journal_id;
    req.session.user.journal = result;

    await req.session.save();

    return res.json({ result: req.session.user });
  },

  async getUserById(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.userId) return res.json({ error: 'User id not found' });

    const model = new UserModel();

    model.filter('user_id').eq(req.body.userId);

    let result;

    try {
      [result] = await model.commit();
    } catch (error) {
      return res.json({ error: error.message });
    }

    return res.json({ result });
  }
};
