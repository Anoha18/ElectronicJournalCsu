const JournalModel = require('../models/journal/JournalModel.js');

module.exports = {
  async getJournals(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    let user = req.session.user;

    if (!user.dean_worker) {
      return res.json({ error: 'User not dean worker' });
    }

    let model = new JournalModel();
    let result;

    model.filter().raw(`
      t.owner_id != ${user.user_id}
      and exists (select 1 from t_user_prop tup1, t_prop tp1, t_prop_value tpv1
        where 1=1
          and tup1.user_id = ${user.user_id}
          and tp1.prop_id = tup1.prop_id
          and tpv1.prop_value_id = tup1.prop_value_id
          and tp1.brief = ''faculty''
          and exists (
            select 1 from t_user_prop tup2
            where 1=1
              and tup2.user_id = t.owner_id
              and tup2.prop_id = tup1.prop_id
              and tup2.prop_value_id = tup1.prop_value_id
          )
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
}