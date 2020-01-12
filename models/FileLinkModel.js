const db = require('../db/index.js');
const {Table} = require('../db/Table.js');

class FileLinkModel extends Table {
  constructor() {
    super('t_file_link tfl');

    this.select('*');
  }
}

module.exports = FileLinkModel;
