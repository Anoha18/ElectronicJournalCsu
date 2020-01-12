const StudentModel = require('../models/StudentModel.js');

module.exports = {
  async addStudent(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.session.user.admin) {
      return res.json({ error: 'User not admin' });
    }

    let row, model = new StudentModel();

    let record = {
      name: req.body.name,
      lastname: req.body.lastname,
      patronymic: req.body.patronymic,
      birthdate: req.body.birthdate,
    }

    try {
      [row] = await model.insert(record)
    } catch (e) {
      console.error(e.message);

      return res.json({error: e.message});
    }

    await Promise.all(Object.keys(req.body.props).map(async (key) => {
      let prop = req.body.props[key];

      if (!prop) return;

      if (prop.prop_value_id || prop.value) {
        prop.student_id = row.student_id;

        if (!prop.prop_id) {
          let error = 'prop_id is not defined!';

          console.stack(error);

          return {error};
        }

        await StudentModel.saveProp(prop);
      }
    }));

    await model.clear();

    try {
      [result] = await model.filter('student_id').eq(row.student_id).commit();
    } catch (e) {
      console.error(e.message);

      return res.json({error: e.message});
    }

    return res.json({ result });
  }
}