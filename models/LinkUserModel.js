const db = require('../db/index.js');
const {Table} = require('../db/Table.js');

class LinkUserModel extends Table {
  constructor() {
    super('t_user_link tul');

    this.select(
      'tul.user_link_id',
      'tul.user_id',
      'tul.link_type_id',
      'tul.object_id',
    );
  }
}

module.exports = LinkUserModel;
