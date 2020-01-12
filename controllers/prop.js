const PropValueModel = require('../models/propValue/PropValueModel.js');

module.exports = {
  async getPropValue(req, res) {
    let model = new PropValueModel();
    let result;

    try {
      [result] = (req.body.brief) ? 
        await model.filter('brief').eq(req.body.brief) :
        await model.filter('prop_value_id').eq(req.body.propValueId);
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }

    return res.json({result});
  },

  async getPropsByParentId(req, res) {
    if (!req.body.parentId) {
      return res.json({error: 'Parent Id not found'});
    }

    let model = new PropValueModel().filter('parent_id').eq(req.body.parentId);
    let result;

    try {
      result = await model.commit();  
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }

    return res.json({result}); 
  },

  async getPropsList(req, res) {
    if (!req.body.brief) {
      return res.json({error: 'Prop brief not found'});
    }
    
    let model = new PropValueModel().filter('prop').eq(req.body.brief);
    let result;

    try {
      result = await model.commit();
    } catch (e) {
      console.error(e);
  
      return res.json({error: e.message});
    }

    return res.json({result});
  }
};
