const db = require('../db/index.js');
const {Table} = require('../db/Table.js');

class ChatLinkModel extends Table {
  constructor() {
    super('t_chat_link tcl');

    this.select(
      'tcl.chat_link_id id',
      'tcl.chat_link_id',
      'tcl.user_id',
      'tcl.chat_id',
      'tcl.link_type_id',
      'tlt.brief link_type_brief',
    )
      .left('t_link_type tlt').on('tlt.link_type_id', 'tcl.link_type_id');
  }
}

module.exports = ChatLinkModel;
