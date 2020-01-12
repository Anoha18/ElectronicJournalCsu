const ChatModel = require('../models/ChatModel.js');

module.exports = {
  async getChatList(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    const data = req.body;

    if (!data.userId) return res.json({ error: 'User id not found' });

    const model = new ChatModel();

    model
      .existsInChatLink(data.userId)
      .getMessages()
      .getObjectUser(data.userId)
      .getMembers();

    let result;

    try {
      result = await model.commit();
    } catch (error) {
      return res.json({ error: error.message });
    }

    return res.json({ result });
  },

  async getChat(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    const user = req.session.user;
    const data = req.body;

    if (!data.chatId) return res.json({ error: 'Chat id not found' });

    const model = new ChatModel();

    model
      .filter('chat_id').eq(data.chatId)
      .getMessages()
      .getObjectUser(user.user_id)
      .getMembers();
    
    let result;

    try {
      [result] = await model.commit();
    } catch (error) {
      return res.json({ error: error.message });
    }

    return res.json({ result });
  }
};
