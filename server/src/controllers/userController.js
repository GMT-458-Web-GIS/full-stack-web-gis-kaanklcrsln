import * as userService from '../services/userService.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await userService.getUserById(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
