const db = require('../db/index.js');
const ItemModel = require('../models/Item/ItemModel.js');
const ClassModel = require('../models/Class/ClassModel.js');

module.exports = {
  async saveItem(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body) return res.json({ error: 'Body not found' });

    if (req.body.columnDate) {
      let data = {
        owner_id: req.body.owner_id,
        type_id: 3,
        date_val: req.body.columnDate,
        table_id: req.body.table_id,
        description: req.body.description,
      }

      let model = new ItemModel();
      let _class = new ClassModel();
      let instance;

      _class.filter('date_val').eq(req.body.columnDate)
        .filter('table_id').eq(req.body.table_id);
        // date_val = ''${}''
        // and table_id = ${}

      try {
        [instance] = await _class.commit();
      } catch (e) {
        console.error(e.message);

        return res.json({ error: e.message });
      }

      if (instance) {
        return res.json({ wrong: 'Занятие в эту дату уже записано' });
      }

      let result;

      try {
        [result] = await model.insert(data)
      } catch (e) {
        console.error(e.message);

        return res.json({ error: e.message });
      }

      return res.json({ result });
    }

    const model = new ItemModel();
    let row;

    try {
      [row] = req.body.item_id ?
        await model.update(req.body.item_id, req.body) :
        await model.insert(req.body);
    } catch (error) {
      console.error(error);

      return res.json({error: error.message});
    }

    return res.json({result: row});
    
  },

  async getClassesByTableId(req, res) {
    if (!req.body) return res.json({ error: 'Data not found' });

    if (!req.session) return res.json({ error: 'Not session' });

    let model = new ClassModel();

    model
      .filter('table_id').eq(req.body.table_id)
      .filter('deleted').eq('false');

    let result;

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e.message);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },

  async getInfoByStudent(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.body.studentId) {
      return res.json({ error: 'Student id not found' });
    }

    let result;
    const record = `
        select count(*) all_classes,
      (100 * (select count(*) in_classes
      from t_item as ti
        inner join t_item_type tit on tit.item_type_id = ti.type_id
        inner join t_table tt on tt.table_id = ti.table_id
        inner join t_table_prop ttp on ttp.table_id = tt.table_id
        inner join t_prop tp on tp.prop_id = ttp.prop_id
        inner join t_prop_value tpv on tpv.prop_value_id = ttp.prop_value_id
        inner join t_student_prop tsp on tsp.student_id = ${req.body.studentId}
      where not ti.deleted = true
        and tit.brief = 'poseshcheniye'
        and tp.brief = 'nomer_gruppy'
        and tsp.prop_id = ttp.prop_id
        and tsp.prop_value_id = ttp.prop_value_id
        and ti.student_id = ${req.body.studentId}
        and ti.bool_val = true
        and tt.deleted = false) / count(*)) percent_in_classes,
        
        (select count(*) 
      from t_item as ti
        inner join t_item_type tit on tit.item_type_id = ti.type_id
        inner join t_table tt on tt.table_id = ti.table_id
        inner join t_table_prop ttp on ttp.table_id = tt.table_id
        inner join t_prop tp on tp.prop_id = ttp.prop_id
        inner join t_prop_value tpv on tpv.prop_value_id = ttp.prop_value_id
        inner join t_student_prop tsp on tsp.student_id = ${req.body.studentId}
      where not ti.deleted = true
        and tit.brief = 'poseshcheniye'
        and tp.brief = 'nomer_gruppy'
        and tsp.prop_id = ttp.prop_id
        and tsp.prop_value_id = ttp.prop_value_id
        and ti.student_id = ${req.body.studentId}
        and ti.bool_val = true
        and tt.deleted = false) in_classes,
      
      (select count(*) 
      from t_item as ti
        inner join t_item_type tit on tit.item_type_id = ti.type_id
        inner join t_table tt on tt.table_id = ti.table_id
        inner join t_table_prop ttp on ttp.table_id = tt.table_id
        inner join t_prop tp on tp.prop_id = ttp.prop_id
        inner join t_prop_value tpv on tpv.prop_value_id = ttp.prop_value_id
        inner join t_student_prop tsp on tsp.student_id = ${req.body.studentId}
      where not ti.deleted = true
        and tit.brief = 'poseshcheniye'
        and tp.brief = 'nomer_gruppy'
        and tsp.prop_id = ttp.prop_id
        and tsp.prop_value_id = ttp.prop_value_id
        and ti.student_id = ${req.body.studentId}
        and ti.bool_val = false
        and tt.deleted = false) missed_classes,
        
      ( 100 * (select count(*) in_classes
      from t_item as ti
        inner join t_item_type tit on tit.item_type_id = ti.type_id
        inner join t_table tt on tt.table_id = ti.table_id
        inner join t_table_prop ttp on ttp.table_id = tt.table_id
        inner join t_prop tp on tp.prop_id = ttp.prop_id
        inner join t_prop_value tpv on tpv.prop_value_id = ttp.prop_value_id
        inner join t_student_prop tsp on tsp.student_id = ${req.body.studentId}
      where not ti.deleted = true
        and tit.brief = 'poseshcheniye'
        and tp.brief = 'nomer_gruppy'
        and tsp.prop_id = ttp.prop_id
        and tsp.prop_value_id = ttp.prop_value_id
        and ti.student_id = ${req.body.studentId}
        and ti.bool_val = false
        and tt.deleted = false) / count(*)
      ) percent_missed_classes
      
      from t_item as ti, t_item_type as tit, t_table as tt,
      t_table_prop as ttp, t_prop as tp, t_prop_value as tpv, t_student_prop as tsp
      where not ti.deleted = true
      and ti.table_id = tt.table_id
      and tit.item_type_id = ti.type_id
      and tit.brief = 'data_zanyatiya'
      and ttp.table_id = tt.table_id
      and tp.prop_id = ttp.prop_id
      and tpv.prop_value_id = ttp.prop_value_id
      and tp.brief = 'nomer_gruppy'
      and tsp.prop_id = ttp.prop_id
      and tsp.prop_value_id = ttp.prop_value_id
      and tsp.student_id = ${req.body.studentId}
      and tt.deleted = false
      having (count(*) > 0);
    `;

    try {
      result = await db.sql(record);
    } catch (e) {
      console.error(e.message);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },

  // async saveItem(req, res) {
    
  // }
};