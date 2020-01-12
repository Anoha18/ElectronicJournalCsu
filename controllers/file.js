const FileModel = require('../models/FileModel.js');
const FileLinkModel = require('../models/FileLinkModel.js');


module.exports = {
  async uploadFile(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    if (!req.file || !req.body.oid) {
      return res.json({ error: 'File or object id not found' });
    }

    const user = req.session.user;

    const file = req.file,
      objectId = +req.body.oid,
      linkType = +req.body.ltid,
      ftype = req.body.ftype;

    const filePath = '' + file.path.replace(/\\/g, '\/');

    const fileDataRecord = {
      file_name: file.filename,
      path: filePath,
      mime_type: file.mimetype,
      file_type: ftype,
      user_id: user.user_id,
    };

    const fModel = new FileModel();
    let insFile;

    try {
      [insFile] = await fModel.insert(fileDataRecord);
    } catch (e) {
      console.error(e.message);

      return res.json({ error: e.message });
    }

    if (!insFile) {
      return res.json({error: 'При загрузке файла произошла ошибка'});
    }

    const linkFileRecord = {
      file_id: insFile.file_id,
      object_id: user.user_id,
      link_type_id: linkType,
    };

    const lfModel = new FileLinkModel();
    let insLink;

    try {
      [insLink] = await lfModel.insert(linkFileRecord);
    } catch (e) {
      console.error(e.message);

      return res.json({ error: e.message });
    }

    if (!insLink) {
      return res.json({error: 'Файл не был привязан'});
    }

    let result;
    const model = new FileModel().filter('file_id').eq(insFile.file_id);

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e.message);

      return res.json({ error: e.message });
    }

    return res.json({ result });
  },
}