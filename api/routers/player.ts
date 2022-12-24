import express, { Request, Response, NextFunction } from 'express';
import passport from '../config/passport-config.js';

import config from '../config/config.js';

import CrudController from '../controllers/CRUDController.js';

const router = express.Router();

const auth = config.auth.disabled ?
	async (req: Request, res: Response, done: Function) => {done(null, false)} :
	passport.authenticate('jwt', { session: false });

const reqValidator =
{
	post: (req: Request, res: Response, next: NextFunction) =>
	{
		if (!req.params.id)
		{
			res.status(400);
			return res.send('Error: Malformed request. Please include ID parameter in the request path');
		}

		if (isNaN(Number(req.params.id)))
		{
			res.status(400);
			return res.send('Error: Malformed request. Player IDs must be numeric');
		}

		if (Object.keys(req.body).length === 0)
		{
			return res
				.status(400)
				.send('Error: Malformed Request. POST must have request body');
		}

		next();
	},

	get: (req: Request, res: Response, next: NextFunction) =>
	{
		if (!req.params.id)
		{
			res.status(400);
			return res.send('Error: Malformed request. Please include ID parameter in the request path');
		}

		if (isNaN(Number(req.params.id)))
		{
			res.status(400);
			return res.send('Error: Malformed request. Player IDs must be numeric');
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

		if (isNaN(Number(req.params.id)))
		{
			res.status(400);
			return res.send('Error: Malformed request. Player IDs must be numeric');
		}

		if (Object.keys(req.body).length === 0)
		{
			return res
				.status(400)
				.send('Error: Malformed Request. PUT must have request body');
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

		if (isNaN(Number(req.params.id)))
		{
			res.status(400);
			return res.send('Error: Malformed request. Player IDs must be numeric');
		}

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