import * as chatService from '../services/chatService.js';

export async function getMessages(req, res, next) {
  try {
    const messages = await chatService.getMessagesByRoom(req.params.roomId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function postMessage(req, res, next) {
  try {
    const { content } = req.body;
    const message = await chatService.createMessage({ roomId: req.params.roomId, userId: req.user.id, content });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}
