const TableModel = require('../models/table/TableModel.js');

module.exports = {
  async getTablesList(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({error: 'User not found'});
    }

    let journal_id = req.body.journal_id;
    let result;
    let model = new TableModel()
      .filter('journal_id').eq(journal_id)
      .filter('deleted').eq('false');

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e.message);
  
      return res.json({error: e.message});
    }

    return res.json({result});
  },

  async addTable(req, res) {
    if (!req.body || !req.body.name || !req.body.props) {
      return res.json({error: 'Not all data delivered'});
    }

    if (!req.session || !req.session.user) {
      return res.json({error: 'User not found'});
    }

    let record = {
      name: req.body.name,
      journal_id: req.session.user.journal_id || req.body.journal_id,
      owner_id: req.session.user.user_id,
    }

    let model = new TableModel();
    let row;

    try {
      [row] = await model.insert(record);
    } catch (e) {
      console.error(e.message);
  
      return res.json({error: e.message});
    }

    await Promise.all(Object.keys(req.body.props).map(async (key) => {
      let prop = req.body.props[key];

      if (!prop) return;

      if (prop.prop_value_id || prop.value) {
        prop.table_id = row.table_id;

        if (!prop.prop_id) {
          let error = 'prop_id is not defined!';

          console.stack(error);

          return {error};
        }

        await TableModel.saveProp(prop);
      }
    }));

    let instance;

    try {
      [instance] = await model.filter('table_id').eq(row.table_id).commit();
    } catch (e) {
      console.error(e.message);
  
      return res.json({error: e.message});
    }

    return res.send({result: instance});
  },

  async getTable(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({error: 'User not found'});
    }

    if (!req.body.tableId) {
      return res.json({error: 'Table Id not found'});
    }

    let model = new TableModel().filter('table_id').eq(req.body.tableId).limit(1);

    if (req.body.infoStudent) {
      model.studentInfoByTable(req.body.infoStudent);
    }

    let result;

    try {
      [result] = await model.commit();
    } catch (e) {
      console.error(e.message);
  
      return res.json({error: e.message});
    }

    return res.json({result});
  },

  async setTableColumnData(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.table_id) {
      return res.json({ error: 'Table Id not found' });
    }

    let model = new TableModel();
    let result;
    let record = req.body;

    if (!record) {
      return res.json({ error: 'Not all data delivered' });
    }

    try {
      [result] = await model.update(record.table_id, record);
    } catch (e) {
      console.error(e.message);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },

  async getTablesByStudent(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.studentId) {
      return res.json({ error: 'Student id not found' });
    }

    let model = new TableModel();
    let result;

    model.filter().raw(`
      exists (select 1 from t_table_prop ttp, t_student_prop tsp, t_prop tp, t_prop_value tpv
        where 1=1
          and ttp.table_id = t.table_id
          and tsp.student_id = ${req.body.studentId}
          and tp.prop_id = ttp.prop_id
          and tp.brief = ''nomer_gruppy''
          and tpv.prop_value_id = ttp.prop_value_id
          and tsp.prop_id = ttp.prop_id
          and tsp.prop_value_id = ttp.prop_value_id
      )
    `);

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e.message);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },
};
