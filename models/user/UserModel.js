/* eslint-disable class-methods-use-this */
const db = require('../../db/index.js');
const {Table} = require('../../db/Table.js');

class User extends Table {
  constructor() {
    super('t_user as tu');

    this.select(
      'tu.user_id',
      'tu.login',
      'tu.email',
      'tu.name',
      'tu.lastname',
      'tu.patronymic',
      'tu.address',
      "to_char(tu.birthdate, ''DD.MM.YYYY'') as birthdate",
      "concat(tu.name, '' '' ,tu.lastname) person",
      'tu.deleted',
      "lower(concat(tu.name, '' '' ,tu.lastname)) search_person",
      'tu.admin',
      'tu.dean_worker',
      `${this.userProps()} as props`,
      this.avatar(),
    )
  }

  static async saveProp({user_id, prop_id, 
    prop_value_id = null, value = null}
  ) {
    if (!user_id || !prop_id) 
      throw new Error('Can\'t save prop. user_id or prop_id is not defined.');

    if (!(user_id || prop_value_id || value))
      throw new Error('Can\'t save prop. user_id or prop_value_id must be defined.');

    return db.sql(`
        with 
            upsert_u as (
              update t_user_prop ttp
                 set prop_value_id = $3, val = $4
               where ttp.user_id = $1 and ttp.prop_id = $2
               returning ttp.*
            ),
            upsert_i as (
               insert into t_user_prop (user_id, prop_id, prop_value_id, val) 
                 select $1, $2, $3, $4
                  where not exists (select 1 from upsert_u) returning * )
        select * from upsert_u 
        union all 
        select * from upsert_i
    `, [user_id, prop_id, prop_value_id, value]);
  }

  userProps() {
    return `
      (
        select json_object_agg(brief,prop) from
        (
          select t.prop_brief as brief, row_to_json(t)::json as prop from
          (
            select
              tup.user_prop_id, tup.prop_id, tup.prop_value_id,
              tup.val, tp.brief prop_brief, tp.name,
              tpv.brief prop_value_brief
            from t_user_prop tup
              inner join t_prop tp on tp.prop_id = tup.prop_id
              inner join t_prop_value tpv on tpv.prop_value_id = tup.prop_value_id
            where 1=1
            and tup.user_id = tu.user_id
          ) t
        ) t1
      ) 
    `;
  }

  avatar() {
    return `
      (
        select ''/'' || tf.path 
        from t_file tf
        inner join t_file_link tfl on tfl.file_id = tf.file_id
        inner join t_link_type tlt on tlt.link_type_id = tfl.link_type_id
        where 1=1
          and tf.deleted = false
          and tlt.brief = ''avatar''
          and tfl.object_id = tu.user_id
        order by tf.file_id desc limit 1
      ) avatar_path
    `;
  }
}

module.exports = User;
