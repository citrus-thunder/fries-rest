import express, { Request, Response, NextFunction } from 'express';
import passport from '../config/passport-config.js';

import config from '../config/config.js';

import CrudController from '../controllers/CRUDController.js';

const router = express.Router();

const auth = config.auth.disabled ?
	async (req: Request, res: Response, done: Function) => {done(null, false)} :
	passport.authenticate('jwt', { session: false });

const controller = new CrudController('monsters', 'monsterId');

const reqValidator =
{
	post: (req: Request, res: Response, next: NextFunction) =>
	{
		if (!req.params.id)
		{
			res.status(400);
			return res.send('Error: Malformed request. Please include ID parameter in the request path');
		}

		// todo: ensure any required fields are in req body

		next();
	},

	get: (req: Request, res: Response, next: NextFunction) =>
	{
		if (!req.params.id)
		{
			res.status(400);
			return res.send('Error: Malformed request. Please include ID parameter in the request path');
		}

		next();
	},

	put: (req: Request, res: Response, next: NextFunction) =>
	{
		if (!req.params.id)
		{
			res.status(400);
			return res.send('Error: Malformed request. Please include ID parameter in the request path');
		}

		next();
	},

	delete: (req: Request, res: Response, next: NextFunction) =>
	{
		if (!req.params.id)
		{
			res.status(400);
			return res.send('Error: Malformed request. Please include ID parameter in the request path');
		}

		next();
	}
}

router.route('/:id')
	.post(auth, reqValidator.post, controller.create)
	.get(auth, reqValidator.get, controller.read)
	.put(auth, reqValidator.put, controller.update)
	.delete(auth, reqValidator.delete, controller.delete);

export default router;