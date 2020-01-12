const MessageModel = require('../models/MessageModel');
const ChatModel = require('../models/ChatModel');
const ChatLinkModel = require('../models/ChatLinkModel');

module.exports = {
  async addMessage(req, res) {
    if (!req.session || !req.session.user) {
      return res.json({ error: 'User not found' });
    }

    const data = req.body;

    if (!data.chatId) {
      let chat;
      const chatModel = new ChatModel();

      chatModel.filter().raw(`
        exists 
        ( 
          select 1 from t_chat_link tcl
          inner join t_link_type tlt on tlt.link_type_id = tcl.link_type_id
          where tlt.brief = ''chat_member''
          and tcl.chat_id = t.chat_id
          and tcl.user_id = ${data.objectId}
          and exists (
            select 1 from t_chat_link tcl1
            inner join t_link_type tlt1 on tlt1.link_type_id = tcl1.link_type_id
            where tlt.brief = ''chat_member''
            and tcl1.chat_id = t.chat_id
            and tcl1.user_id = ${data.ownerId}
          )
        )
      `);

      try {
        [chat] = await chatModel.commit();
      } catch (error) {
        return res.json({ error: error.message });
      }

      if (!chat) {
        const chatRecord = {
          owner_id: data.ownerId,
        };

        try {
          [chat] = await chatModel.insert(chatRecord);
        } catch (error) {
          return res.json({ error: error.message });
        }

        const chatLinkModel = new ChatLinkModel();

        try {
          await chatLinkModel.insert({
            user_id: data.ownerId,
            chat_id: chat.chat_id,
            link_type_id: 3,
          });
          await chatLinkModel.insert({
            user_id: data.objectId,
            chat_id: chat.chat_id,
            link_type_id: 3,
          });
        } catch (error) {
          return res.json({ error: error.message });
        }
      }

      const messageModel = new MessageModel();

      const message = {
        message_type_id: 1,
        message_status_id: 1,
        chat_id: chat.chat_id,
        owner_id: data.ownerId,
        parent_id: data.parentId,
        text: data.text,
      }

      let result;

      try {
        [result] = await messageModel.insert(message);
      } catch (error) {
        return res.json({ error: error.message });
      }

      let instance;

      try {
        [instance] = await messageModel.filter('message_id').eq(result.message_id).commit();
      } catch (error) {
        return res.json({ error: error.message });
      }

      return res.json({ instance });
    }

    const messageModel = new MessageModel();

    const message = {
      message_type_id: 1,
      message_status_id: 1,
      chat_id: data.chatId,
      owner_id: data.ownerId,
      parent_id: data.parentId,
      text: data.text,
    };

    let row;

    try {
      [row] = await messageModel.insert(message);
    } catch (error) {
      return res.json({ error: error.message });
    }

    let instance;

    try {
      [instance] = await messageModel.filter('message_id').eq(row.message_id).commit();
    } catch (error) {
      return res.json({ error: error.message });
    }

    return res.json({ instance });
  }
};
