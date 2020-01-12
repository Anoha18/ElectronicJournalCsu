const StudentModel = require('../models/StudentModel.js');

module.exports = {
  async getStudentsByGroup(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.prop_id || !req.body.prop_value_id) {
      return res.json({ error: 'Prop id or prop value id not found' });
    }
    
    
    let model = new StudentModel();
    let result;

    model.filter().raw(`
      exists(select 1 from t_student_prop tsp
      where 1=1
        and tsp.student_id = t.student_id
        and tsp.prop_value_id = ${req.body.prop_value_id}
        and tsp.prop_id = ${req.body.prop_id}
      )
    `);

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },

  async getStudentById(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.studentId) {
      return res.json({ error: 'Student Id not found' });
    }

    let model = new StudentModel();
    let result;

    model.filter('student_id').eq(req.body.studentId);

    try {
      [result] = await model.commit();
    } catch (e) {
      console.error(e);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },

  async setStudentColumn(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.studentId || !req.body.columnName) {
      return res.json({ error: 'Not all data delivered' });
    }

    let record = {};

    record[req.body.columnName] = req.body.columnValue || null;

    const model = new StudentModel();
    let result;

    try {
      result = await model.update(req.body.studentId, record);
    } catch (e) {
      console.error(e);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },

  async getStudentsByTableId(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.tableId) {
      return res.json({error: 'Table id not found'});
    }
    
    const model = new StudentModel();

    model.filterByTableId(req.body.tableId);

    let result;

    try {
      result = await model.commit();
    } catch (error) {
      console.error(error);

      return res.json({error: error.message});
    }

    return res.json({result});
  },
};
