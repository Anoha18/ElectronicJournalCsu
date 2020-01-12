const db = require('../../db/index.js');
const {Table} = require('../../db/Table.js');

class Journal extends Table {
  constructor() {
    super('t_journal as tj');

    this.select(
      'tj.journal_id',
      'tj.owner_id',
      "to_char(tj.ins_date, ''DD.MM.YYYY'') ins_date",
      'tj.deleted',
      `(select row_to_json(usr) 
        from
          (select 
            tu.user_id, tu.login, tu.email,
            tu.name, tu.lastname, tu.patronymic,
            tu.address, to_char(tu.birthdate, ''DD.MM.YYYY'') as birthdate,
            concat(tu.name, '' '' ,tu.lastname) person
          from t_user tu
          where 1=1
            and tu.user_id = owner_id
          ) as usr) as owner`,
    );
  }
}

module.exports = Journal;
