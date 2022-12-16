import express, { Request, Response, NextFunction } from 'express';
import passport from '../config/passport-config.js';

import config from '../config/config.js';

import CrudController from '../controllers/CRUDController.js';

const router = express.Router();

const auth = config.auth.disabled ?
	async (req: Request, res: Response, done: Function) => {done(null, false)} :
	passport.authenticate('jwt', { session: false });

// todo: we will flesh out this reqValidator once we have clearer
// requirements for the player model.
// Other routers will receive the same treatment.

const reqValidator =
{
	post: (req: Request, res: Response, next: NextFunction) =>
	{
		// todo
		// - ensure req has valid ID param
		// - ensure any required fields are in req body

		next();
	},

	get: (req: Request, res: Response, next: NextFunction) =>
	{
		// todo
		// - ensure req has valid ID param

		next();
	},

	put: (req: Request, res: Response, next: NextFunction) =>
	{
		// todo
		// - ensure req has valid ID param

		next();
	},

	delete: (req: Request, res: Response, next: NextFunction) =>
	{
		// todo
		// - ensure req has valid ID param

		next();
	}
}

const controller = new CrudController('players', 'userId');

router.route('/:id')
	.post(auth, reqValidator.post, controller.create)
	.get(auth, reqValidator.get, controller.read)
	.put(auth, reqValidator.put, controller.update)
	.delete(auth, reqValidator.delete, controller.delete);

export default router;