const db = require('../../db/index.js');
const {Table} = require('../../db/Table.js');

class PropValueModel extends Table {
  constructor() {
    super('t_prop_value as tpv');

    this.select(
      'tpv.prop_value_id',
      'tpv.prop_value_id id',
      'tpv.prop_id',
      'tpv.brief',
      'tpv.value',
      'tpv.parent_id',
      'tpv.description',
      'tp.prop_id',
      'tp.brief prop',
    )

      .join('t_prop tp').on('tp.prop_id','tpv.prop_id');
  }
}

module.exports = PropValueModel;
