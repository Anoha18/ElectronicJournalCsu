const db = require('../db/index.js');
const {Table} = require('../db/Table.js');

class FileModel extends Table {
  constructor() {
    super('t_file tf');

    this.select(
      'tf.file_id',
      'tf.file_id as row_id',
      'tf.file_name',
      'tf.user_id',
      'tf.path',
      " ''/'' || tf.path as file_url",
      'tf.deleted',
      'tf.ins_date',
      'tf.mime_type',
      'tfl.file_link_id',
      'tfl.object_id',
      'tfl.link_type_id',
    )
      .left('t_file_link tfl')
      .on('tfl.file_id', 'tf.file_id')
      .left('t_user tu')
      .on('tu.user_id', 'tf.user_id')
      .filter('deleted')
      .eq('false');
  }
}

module.exports = FileModel;