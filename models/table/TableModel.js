/* eslint-disable class-methods-use-this */
const db = require('../../db/index.js');
const {Table} = require('../../db/Table.js');

class TableModel extends Table {
  constructor() {
    super('t_table as tt');

    this.select(
      'tt.table_id',
      'tt.name',
      'tt.ins_date',
      'tt.journal_id',
      'tt.owner_id',
      'tt.deleted',
      'tt.description',
      `${this.tableProps()} as props`,
    )
      .filter('deleted').eq('false')
      .sort('table_id desc');
  }

  static async saveProp({table_id, prop_id, 
    prop_value_id = null, value = null}
  ) {
    if (!table_id || !prop_id) 
      throw new Error('Can\'t save prop. table_id or prop_id is not defined.');

    if (!(table_id || prop_value_id || value))
      throw new Error('Can\'t save prop. table_id or prop_value_id must be defined.');

    return db.sql(`
        with 
            upsert_u as (
              update t_table_prop ttp
                 set prop_value_id = $3, val = $4
               where ttp.table_id = $1 and ttp.prop_id = $2
               returning ttp.*
            ),
            upsert_i as (
               insert into t_table_prop (table_id, prop_id, prop_value_id, val) 
                 select $1, $2, $3, $4
                  where not exists (select 1 from upsert_u) returning * )
        select * from upsert_u 
        union all 
        select * from upsert_i
    `, [table_id, prop_id, prop_value_id, value]);
  }

  tableProps() {
    return `
      (select json_object_agg(brief,prop) from (
        select t.prop_brief as brief, row_to_json(t)::json as prop from (
          select 
            ttp.table_prop_id, ttp.prop_id, ttp.prop_value_id,
            ttp.val, tp.brief prop_brief, tp.name,
            tpv.brief prop_value_brief
          from t_table_prop ttp
            inner join t_prop tp on tp.prop_id = ttp.prop_id
            inner join t_prop_value tpv on tpv.prop_value_id = ttp.prop_value_id
          where 1=1
          and ttp.table_id = tt.table_id
        ) t
      ) t1 )
    `;
  }

  tableStudent() {
    return `
      (
        select json_agg(student) from 
        (
          select
            ts.student_id,
            ts.name,
            ts.lastname,
            concat(ts.name, '' '' ,ts.lastname) person,
            ts.patronymic,
            to_char(ts.birthdate, ''DD.MM.YYYY'') as birthdate,
            tsp.val number_group,
            tpv.prop_value_id,
            tpv.brief,
            tp.prop_id,
            ts.description
          from t_student ts
            left join t_student_prop tsp on tsp.student_id = ts.student_id
            left join t_prop tp on tp.prop_id = tsp.prop_id
            left join t_prop_value tpv on tpv.prop_value_id = tsp.prop_value_id
            left join t_table_prop ttp on ttp.table_id = tt.table_id
          where 1=1
            and ttp.prop_id = tsp.prop_id
            and ttp.prop_value_id = tsp.prop_value_id
            and tp.brief = ''nomer_gruppy''
          order by ts.lastname
        ) as student
      ) as students
    `;
  }

  getClass() {
    return `
     (
        select json_agg(class) from 
        (
          select
            ti.item_id,
            to_char(ti.date_val, ''DD.MM.YYYY'') date,
            ti.description,
            ti.owner_id,
            (select row_to_json(t) 
              from (
                select
                from t_item_prop tip
                  inner join t_prop_value tpv on tpv.prop_value_id = tip.prop_value_id
                  inner join t_prop tp on tp.prop_id = tip.prop_id
                where
                  tp.brief = ''tip_zanyatiya''
              ) t
            ) tip_zanyatya
          from t_item ti, t_item_type tit, t_item_prop tip, t_prop_value tpv
          where 1=1
            and ti.parent_id = tt.table_id
            and tit.item_type_id = ti.type_id
            and tit.brief = ''data_zanyatiya''
            and tip.item_id = ti.item_id
            and tpv.prop_value_id = tip.prop_value_id
            and deleted = false
        ) as class
      ) as classes
    `;
  }

  studentInfoByTable(studentId) {
    const studentInfo = `
    (select row_to_json(t) from (
      select count(*) all_classes,
        (select count(*)
        from t_item ti1, t_item_type tit1
        where not ti1.deleted = true
          and ti1.table_id = tt.table_id
          and tit1.item_type_id = ti1.type_id
          and tit1.brief = ''poseshcheniye''
          and ti1.student_id = ${studentId}
          and ti1.bool_val = true) in_classes,
        (select count(*)
        from t_item ti1, t_item_type tit1
        where not ti1.deleted = true
          and ti1.table_id = tt.table_id
          and tit1.item_type_id = ti1.type_id
          and tit1.brief = ''poseshcheniye''
          and ti1.student_id = ${studentId}
          and ti1.bool_val = false) missed_classes,
        (100.0 * (select count(*)
        from t_item ti1, t_item_type tit1
        where not ti1.deleted = true
          and ti1.table_id = tt.table_id
          and tit1.item_type_id = ti1.type_id
          and tit1.brief = ''poseshcheniye''
          and ti1.student_id = ${studentId}
          and ti1.bool_val = true) / count(*)) percent_in_classes,
        (100.0 * (select count(*)
        from t_item ti1, t_item_type tit1
        where not ti1.deleted = true
          and ti1.table_id = tt.table_id
          and tit1.item_type_id = ti1.type_id
          and tit1.brief = ''poseshcheniye''
          and ti1.student_id = ${studentId}
          and ti1.bool_val = false) / count(*)) percent_missed_classes,
        (select avg(ti1.int_val)
          from t_item ti1, t_item_type tit1
          where not ti1.deleted = true
          and ti1.table_id = tt.table_id
          and tit1.item_type_id = ti1.type_id
          and tit1.brief = ''otsenka''
          and ti1.student_id = ${studentId}) avg_mark
        from t_item as ti, t_item_type as tit
        where not ti.deleted = true
        and ti.table_id = tt.table_id
        and tit.item_type_id = ti.type_id
        and tit.brief = ''data_zanyatiya''
        group by ti.table_id
      ) t
    ) info_student

    `;

    this.selectCol.push(studentInfo);
    
    return this;
  }

  getInfoByAllTable(studentId) {
    const studentInfo = `
    
    `
  }
}

module.exports = TableModel;
