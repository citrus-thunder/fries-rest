import express, { Request, Response, NextFunction } from 'express';
import passport from '../config/passport-config.js';

import config from '../config/config.js';

import CrudController from '../controllers/CrudController.js';

const router = express.Router();

const auth = config.auth.disabled ?
	async (req: Request, res: Response, done: Function) => {done(null, false)} :
	passport.authenticate('jwt', { session: false });

const controller = new CrudController('players', 'userId');

router.route('/:id')
	.post(auth, controller.create)
	.get(auth, controller.read)
	.put(auth, controller.update)
	.delete(auth, controller.delete);

export default router;