/* eslint-disable class-methods-use-this */
const db = require('../db/index.js');
const {Table} = require('../db/Table.js');

class StudentModel extends Table {
  constructor() {
    super('t_student ts');

    this.select(
      'ts.student_id',
      'ts.name',
      'ts.lastname',
      'ts.patronymic',
      'ts.birthdate',
      "concat(ts.name, '' '' ,ts.lastname) person",
      'ts.deleted',
      'ts.description',
      `${this.studentProps()} as props`,
    )
      .filter('deleted').eq('false')
      .sort('lastname');
  }

  static async saveProp({student_id, prop_id, 
    prop_value_id = null, value = null}
  ) {
    if (!student_id || !prop_id) 
      throw new Error('Can\'t save prop. student_id or prop_id is not defined.');

    if (!(student_id || prop_value_id || value))
      throw new Error('Can\'t save prop. student_id or prop_value_id must be defined.');

    return db.sql(`
        with 
            upsert_u as (
              update t_student_prop tsp
                 set prop_value_id = $3, val = $4
               where tsp.student_id = $1 and tsp.prop_id = $2
               returning tsp.*
            ),
            upsert_i as (
               insert into t_student_prop (student_id, prop_id, prop_value_id, val) 
                 select $1, $2, $3, $4
                  where not exists (select 1 from upsert_u) returning * )
        select * from upsert_u 
        union all 
        select * from upsert_i
    `, [student_id, prop_id, prop_value_id, value]);
  }

  studentProps() {
    return `(
      select json_object_agg (brief, prop) from
      (
        select t.prop_brief as brief, row_to_json(t)::json as prop from
        (
         select
              tsp.student_prop_id, tsp.prop_id, tsp.prop_value_id,
              tsp.val, tp.brief prop_brief, tp.name,
              tpv.brief prop_value_brief
            from t_student_prop tsp
              inner join t_prop tp on tp.prop_id = tsp.prop_id
              inner join t_prop_value tpv on tpv.prop_value_id = tsp.prop_value_id
            where 1=1
            and tsp.student_id = ts.student_id
        ) t
      ) t1
    )`;
  }

  filterByTableId(tableId) {
    this.filter().raw(`
      exists (select 1
        from t_table tt
          left join t_student_prop tsp on tsp.student_id = t.student_id
          left join t_prop tp on tp.prop_id = tsp.prop_id
          left join t_prop_value tpv on tpv.prop_value_id = tsp.prop_value_id
          left join t_table_prop ttp on ttp.table_id = tt.table_id
        where tt.table_id = ${tableId}
          and ttp.prop_id = tsp.prop_id
          and ttp.prop_value_id = tsp.prop_value_id
          and tp.brief = ''nomer_gruppy''
        order by t.lastname
      )
    `);

    return this;
  }
}

module.exports = StudentModel;
