const db = require('../db/index.js');
const JournalModel = require('../models/journal/JournalModel.js');

module.exports = {
  async getAccessJournals(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.user_id) {
      return res.json({ error: 'User id not found' });
    }

    let model = new JournalModel();
    let result;

    model.filter().raw(`
      exists(
        select 1 from t_user_link tul, t_link_type tlt
        where 1=1
          and tul.object_id = t.journal_id
          and tul.user_id = ${req.body.user_id}
          and tlt.brief = ''dostyp''
          and tlt.link_type_id = tul.link_type_id
      )
    `);

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e);

      return res.json({ error: e.message });
    }

    return res.json({ result })
  }
};
