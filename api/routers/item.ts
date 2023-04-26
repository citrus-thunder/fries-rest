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
	},

	query: (req: Request, res: Response, next: NextFunction) =>
	{
		if (!req.body.query)
		{
			res.status(400);
			return res.send('Error: Malformed request. Item data query must include a query in the request body');
		}

		next();
	}
}

const controller = new CrudController('items', 'itemId');

const invalidActionHandler = (req: Request, res: Response, next: NextFunction) =>
{
	return res.status(400).send('This action is not available at this endpoint');
}

router.route('/')
	.post(invalidActionHandler)
	.get(auth, reqValidator.query, controller.query)
	.put(invalidActionHandler)
	.delete(invalidActionHandler);

router.route('/:id')
	.post(auth, reqValidator.post, controller.create)
	.get(auth, reqValidator.get, controller.read)
	.put(auth, reqValidator.put, controller.update)
	.delete(auth, reqValidator.delete, controller.delete);

export default router;