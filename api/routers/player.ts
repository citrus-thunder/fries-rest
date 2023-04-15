import express, { Request, Response, NextFunction } from 'express';
import { WithId, Document, UpdateResult, UpdateOptions, DeleteResult } from 'mongodb';
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
		if (req.params.id === undefined)
		{
			res.status(400);
			return res.send('Error: Malformed request. This action requires an ID parameter');
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
		if (req.params.id === undefined)
		{
			res.status(400);
			return res.send('Error: Malformed request. This action requires an ID parameter');
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
		if (req.params.id === undefined)
		{
			res.status(400);
			return res.send('Error: Malformed request. This action requires an ID parameter');
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
		if (req.params.id === undefined)
		{
			res.status(400);
			return res.send('Error: Malformed request. This action requires an ID parameter');
		}

		if (isNaN(Number(req.params.id)))
		{
			res.status(400);
			return res.send('Error: Malformed request. Player IDs must be numeric');
		}

		next();
	},

	query: (req: Request, res: Response, next: NextFunction) =>
		{
		if (!req.body.query)
			{
			res.status(400);
			return res.send('Error: Malformed request. Player data query must include a query in the request body');
			}

		next();
		}
}

const collectionName = 'players';
const identityField = 'userId';
const controller = new CrudController(collectionName, identityField);

// Twitch handles player IDs as strings, but our id param comes in as an int,
// so we'll override non-create actions to "convert" the ID to a 
// string before querying the DB.
controller
	.setRead(async (id: any): Promise<WithId<Document> | null | undefined> =>
	{
		const db = await controller.getDb();

		const filter: any = {};
		filter[identityField] = id.toString();

		return await db?.collection(collectionName).findOne(filter);
	})
	.setUpdate(async (id: any, data: object): Promise<UpdateResult | undefined> =>
	{
		const db = await controller.getDb();

		const filter: any = {};
		filter[identityField] = id.toString();

		const options: UpdateOptions = {upsert: false};

		return await db?.collection(collectionName).updateOne(filter, {$set: data}, options)
	})
	.setDelete(async (id: any): Promise<DeleteResult | undefined> =>
	{
		const db = await controller.getDb();

		const filter: any = {};
		filter[identityField] = id.toString();

		return await db?.collection(collectionName).deleteOne(filter);
	});

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