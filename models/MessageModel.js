/* eslint-disable class-methods-use-this */
const db = require('../db/index.js');
const {Table} = require('../db/Table.js');

class MessageModel extends Table {
  constructor() {
    super('t_message tm');

    this.select(
      'tm.message_id',
      'tm.message_id id',
      'tm.message_type_id',
      'tm.message_status_id',
      'tmt.brief',
      'tmt.name',
      'tms.brief',
      'tms.name',
      'tm.chat_id',
      'tm.owner_id',
      'tm.parent_id',
      'tm.text',
      'tm.ins_date',
      'tm.deleted',
      `to_char(tm.ins_date, ''HH24:MI'') ins_date_time`,
      this.getOwner(),
    )
      .left('t_message_type tmt').on('tmt.message_type_id', 'tm.message_type_id')
      .left('t_message_status tms').on('tms.message_status_id', 'tm.message_status_id')
      .filter('deleted').eq('false');
  }

  getOwner() {
    const col = `
      (
        select row_to_json(t) as owner from
        (
          select
          (
            select ''/'' || tf.path 
            from t_file tf
            inner join t_file_link tfl on tfl.file_id = tf.file_id
            inner join t_link_type tlt on tlt.link_type_id = tfl.link_type_id
            where tf.deleted = false
              and tlt.brief = ''avatar''
              and tfl.object_id = tu.user_id
            order by tf.file_id desc limit 1
          ) avatar_path,
          tu.user_id,
          tu.login,
          tu.email,
          tu.name,
          tu.lastname,
          concat(tu.name, '' '' ,tu.lastname) person,
          lower(concat(tu.name, '' '' ,tu.lastname)) search_person
          from t_user tu
          where tu.user_id = tm.owner_id
        ) t
      )
    `;

    return col;
  }
}

module.exports = MessageModel;
