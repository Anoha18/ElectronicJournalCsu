const db = require('../../db/index.js');
const {Table} = require('../../db/Table.js');

class ItemModel extends Table {
  constructor() {
    super('t_item ti');

    this.select(
      'ti.item_id',
      'ti.type_id',
      'ti.subject_id',
      'ti.owner_id',
      'ti.description',
      'ti.deleted',
      'ti.ins_date',
      'ti.upd_date',
      'ti.parent_id',
      'ti.bool_val',
      'ti.int_val',
      'ti.date_val'
    );
  }
}

module.exports = ItemModel;
