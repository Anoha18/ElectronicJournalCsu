const db = require('../db/index.js');
const {Table} = require('../db/Table.js');

class ChatModel extends Table {
  constructor() {
    super('t_chat tc');

    this.select(
      'tc.chat_id id',
      'tc.chat_id',
      'tc.name',
      'tc.description',
      'tc.ins_date create_date',
      'tc.owner_id',
      'tc.deleted',
      `(
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
          where tu.user_id = tc.owner_id
        ) t
      )`,
    )
      .filter('deleted').eq('false');
  }

  getMembers() {
    const col = `
      (
        select json_agg(t) from 
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
          from t_chat_link tcl
          inner join t_user tu on tu.user_id = tcl.user_id
          inner join t_link_type tlt on tlt.link_type_id = tcl.link_type_id
          where tcl.chat_id = tc.chat_id
            and tlt.brief = ''chat_member''
        ) t
      ) chat_members
    `;

    this.selectCol.push(col);

    return this;
  }

  existsInChatLink(userId) {
    this.filter().raw(`
      exists 
      ( 
        select 1 from t_chat_link tcl
        inner join t_link_type tlt on tlt.link_type_id = tcl.link_type_id
        where tlt.brief = ''chat_member''
        and tcl.chat_id = t.chat_id
        and tcl.user_id = ${userId}
      )
    `);

    return this;
  }

  getMessages() {
    const col = `
    (
      select json_agg(t) as messages from
      (
        select
          tm.message_id,
          tm.message_id id,
          tm.message_type_id,
          tm.message_status_id,
          tmt.brief,
          tmt.name,
          tms.brief,
          tms.name,
          tm.chat_id,
          tm.owner_id,
          tm.parent_id,
          tm.text,
          tm.ins_date,
          tm.deleted,
          to_char(tm.ins_date, ''HH24:MI'') ins_date_time,
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
        from t_message tm
        left join t_message_type tmt on tmt.message_type_id = tm.message_type_id
        left join t_message_status tms on tms.message_status_id = tm.message_status_id
        where tm.deleted = false
          and tm.chat_id = tc.chat_id
        order by tm.ins_date
      ) t
    )
    `;

    this.selectCol.push(col);

    return this;
  }

  getObjectUser(userId) {
    const col = `
      case
        when 
          (
            select count (*) 
            from t_chat_link tcl
            inner join t_link_type tlt on tlt.link_type_id = tcl.link_type_id
            where tcl.chat_id = tc.chat_id
          ) = 2
        then 
          (
            select row_to_json(t) from
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
              inner join t_chat_link tcl on tcl.user_id = tu.user_id
              where tcl.chat_id = tc.chat_id
              and tcl.user_id != ${userId}
              limit 1
            ) t
          )
        else null
      end objectUser
    `;

    this.selectCol.push(col);

    return this;
  }
}

module.exports = ChatModel;
