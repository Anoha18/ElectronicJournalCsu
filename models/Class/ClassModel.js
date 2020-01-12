/* eslint-disable class-methods-use-this */
const db = require('../../db/index.js');
const {Table} = require('../../db/Table.js');

class ClassModel extends Table {
  constructor() {
    super('t_item ti');

    this.select(
      'ti.item_id',
      'ti.type_id',
      'tit.item_type_id',
      'tit.brief brief',
      'tit.name',
      'ti.student_id',
      'ti.owner_id',
      'ti.description',
      'ti.deleted',
      'ti.ins_date',
      'ti.bool_val',
      'ti.int_val',
      "to_char(ti.date_val, ''DD.MM.YYYY'') as date_val_format",
      'ti.date_val',
      'ti.parent_id',
      'ti.table_id',
      this.getStudentsOnClass(),
      this.classOwner(),
      this.getStudentsMarks(),
      this.getStudentZametki(),
    )
      .left('t_item_type tit').on('tit.item_type_id', 'ti.type_id')
      .filter('brief').eq('data_zanyatiya')
      .sort('date_val');
  }

  classOwner() {
    return `
      (
        select row_to_json(t) from
        (
          select
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
            ) avatar_path,
            tu.user_id,
            tu.login,
            tu.email,
            tu.name,
            tu.lastname,
            tu.patronymic,
            tu.address,
            to_char(tu.birthdate, ''DD.MM.YYYY'') as birthdate,
            concat(tu.name, '' '' ,tu.lastname) person
          from t_user tu
          where
            tu.user_id = ti.owner_id
        ) t
      ) as owner
    `
  }
  
  getStudentsOnClass() {
    return `
      (
        select json_agg(student) from 
        (
          select
            ti1.item_id,
            ti1.bool_val,
            ti1.owner_id,
            ti1.owner_id,
            ti1.description,
            concat(tu.name, '' '' ,tu.lastname) person,
            (
              select row_to_json(t) from
              (
                select
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
                  ) avatar_path,
                  tu.user_id,
                  tu.login,
                  tu.email,
                  tu.name,
                  tu.lastname,
                  tu.patronymic,
                  tu.address,
                  to_char(tu.birthdate, ''DD.MM.YYYY'') as birthdate,
                  concat(tu.name, '' '' ,tu.lastname) person
                from t_user tu
                where
                  tu.user_id = ti1.owner_id
              ) t
            ) as owner,
            ti1.description,
            ti1.student_id,
            ti1.parent_id
          from t_student ts, t_item ti1, t_item_type tit, t_user tu
          where 1=1
            and ti1.parent_id = ti.item_id
            and tit.item_type_id = ti1.type_id
            and tit.brief = ''poseshcheniye''
            and ti1.student_id = ts.student_id
            and tu.user_id = ti1.owner_id
            and ts.deleted = false
            and not ti1.deleted = true
        ) as student
      ) as students_on_class
    `;
  }

  getStudentsMarks() {
    return `
      (
        select json_agg(mark) from
        (
          select
            ti1.item_id,
            ts.student_id,
            ti1.int_val,
            ti1.owner_id,
            ti1.description,
            concat(tu.name, '' '' ,tu.lastname) person,
            (
              select row_to_json(t) from
              (
                select
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
                  ) avatar_path,
                  tu.user_id,
                  tu.login,
                  tu.email,
                  tu.name,
                  tu.lastname,
                  tu.patronymic,
                  tu.address,
                  to_char(tu.birthdate, ''DD.MM.YYYY'') as birthdate,
                  concat(tu.name, '' '' ,tu.lastname) person
                from t_user tu
                where
                  tu.user_id = ti.owner_id
              ) t
            ) as owner
          from t_student ts, t_item ti1, t_item_type tit, t_user tu
          where not ts.deleted = true
            and not ti1.deleted = true
            and ti1.parent_id = ti.item_id
            and tit.item_type_id = ti1.type_id
            and tit.brief = ''otsenka''
            and ti1.student_id = ts.student_id
            and tu.user_id = ti1.owner_id
        ) mark
      ) students_marks
    `;
  }

  getStudentZametki() {
    return `
      (
        select json_agg(zametka) from
        (
          select
            ti1.item_id,
            ts.student_id,
            ti1.owner_id,
            ti1.description,
            concat(tu.name, '' '' ,tu.lastname) person,
            (
              select row_to_json(t) from
              (
                select
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
                  ) avatar_path,
                  tu.user_id,
                  tu.login,
                  tu.email,
                  tu.name,
                  tu.lastname,
                  tu.patronymic,
                  tu.address,
                  to_char(tu.birthdate, ''DD.MM.YYYY'') as birthdate,
                  concat(tu.name, '' '' ,tu.lastname) person
                from t_user tu
                where
                  tu.user_id = ti.owner_id
              ) t
            ) as owner
          from t_student ts, t_item ti1, t_item_type tit, t_user tu
          where 1=1
            and ti1.parent_id = ti.item_id
            and tit.item_type_id = ti1.type_id
            and tit.brief = ''zametka''
            and ti1.student_id = ts.student_id
            and tu.user_id = ti1.owner_id
            and ts.deleted = false
            and not ti1.deleted = true
        ) zametka
      ) students_zametki
    `;
  }
}

module.exports = ClassModel;
