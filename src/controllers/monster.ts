import express, { Request, Response } from 'express';
import { WithId, Document, UpdateResult, InsertOneResult, DeleteResult, UpdateOptions } from 'mongodb';
import { ObjectID } from 'bson';
import Debug from 'debug';

import Config from '../config/config.js';
import Client from '../util/mdb.js';

const debug = Debug('fries-rest:controller:monster');

// todo: We will be moving shared CRUD controller logic to its own
// class. For now the bulk of this file is using copied boilerplate
// while we test basic CRUD functionality.

const client = await Client.getClient();
const db = client.db(Config.db.name);

async function createMonster(data: object) : Promise<InsertOneResult>
{
	return await db.collection('monsters').insertOne(data);
}

async function getMonster(monsterId: number) : Promise<WithId<Document> | null>
{
	return await db.collection('monsters').findOne({monsterId: monsterId});
}

async function updateMonster(monsterId: number, data: object) : Promise<UpdateResult>
{
	const options: UpdateOptions =
	{
		upsert: false
	};

	return await db.collection('monsters').updateOne({monsterId: monsterId}, {$set: data}, options);
}

async function deleteMonster(monsterId: number) : Promise<DeleteResult>
{
	return await db.collection('monsters').deleteOne({monsterId: monsterId})
}

export default
{
	create: async (req: Request, res: Response) =>
	{
		const monsterId = parseInt(req.params.id);
		let body: any = null;

		const existingMonster = await getMonster(monsterId);

		if (existingMonster != null)
		{
			res.status(409);
			body = `Cannot create new monster record: Record with ID ${monsterId} already exists!`;
		}
		else
		{
			const monster = await createMonster(req.body);
			if (monster.insertedId)
			{
				res.status(200);
				body = `New monster record created with userId ${monsterId} and Object ID ${monster.insertedId}`;
			}
			else
			{
				res.status(400);
				body = 'Error inserting new monster record: Unable to insert with given request data';
			}
		}

		return res.send(body);
	},

	read: async (req: Request, res: Response) =>
	{
		const monsterId = parseInt(req.params.id);
		const monster = await getMonster(monsterId);
		let body: any = null;

		if (monster == null)
		{
			res.status(404);
			body = `Monster with ID ${monsterId} not found`;
			debug(`Requested monster record not found. ID ${monsterId}`);
		}
		else
		{
			res.status(200);
			body = monster;
			debug(`Requested monster found! Retrieved record for monster with ID ${monsterId}`);
		}

		return res.send(body);
	},

	update: async (req: Request, res: Response) =>
	{
		const monsterId = parseInt(req.params.id);
		const update = req.body;

		const result = await updateMonster(monsterId, update);

		let body: any = null;

		if (result.modifiedCount < 1)
		{
			res.status(400);
			body = 'Error updating monster information: No documents modified';
		}
		else
		{
			res.status(200);
			body = 'Monster record updated!';
		}

		return res.send(body);
	},

	delete: async (req: Request, res: Response) =>
	{
		const monsterId = parseInt(req.params.id);
		let body: any = null;

		const result = await deleteMonster(monsterId);

		if (result.deletedCount > 0)
		{
			res.status(200);
			body = `Monster with ID ${monsterId} deleted`;
		}
		else
		{
			res.status(404);
			body = `Unable to delete monster with ID ${monsterId}`;
		}
		
		return res.send(body);
	}
}