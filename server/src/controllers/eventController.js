import * as eventService from '../services/eventService.js';

export async function listEvents(req, res, next) {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function getNearby(req, res, next) {
  try {
    const { lat, lng, radius } = req.query;
    const events = await eventService.getNearbyEvents(Number(lat), Number(lng), Number(radius) || 10000);
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}
