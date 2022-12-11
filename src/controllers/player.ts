import express, { Request, Response } from 'express';
import { WithId, Document, UpdateResult, InsertOneResult, DeleteResult, UpdateOptions } from 'mongodb';
import { ObjectID } from 'bson';
import Debug from 'debug';

import Config from '../config/config.js';
import Client from '../util/mdb.js';

const debug = Debug('fries-rest:controller:player');

// todo: We will be moving shared CRUD controller logic to its own
// class. For now the bulk of this file is using copied boilerplate
// while we test basic CRUD functionality.

const client = await Client.getClient();
const db = client.db(Config.db.name);

async function createPlayer(data: object) : Promise<InsertOneResult>
{
	return await db.collection('players').insertOne(data);
}

async function getPlayer(playerId: number) : Promise<WithId<Document> | null>
{
	return await db.collection('players').findOne({userId: playerId});
}

async function updatePlayer(playerId: number, data: object) : Promise<UpdateResult>
{
	const options: UpdateOptions =
	{
		upsert: false
	};

	return await db.collection('players').updateOne({userId: playerId}, {$set: data}, options);
}

async function deletePlayer(playerId: number) : Promise<DeleteResult>
{
	return await db.collection('players').deleteOne({userId: playerId})
}

export default
{
	create: async (req: Request, res: Response) =>
	{
		const playerId = parseInt(req.params.id);
		let body: any = null;

		const existingPlayer = await getPlayer(playerId);

		if (existingPlayer != null)
		{
			res.status(409);
			body = `Cannot create new player record: Record with ID ${playerId} already exists!`;
		}
		else
		{
			const player = await createPlayer(req.body);
			if (player.insertedId)
			{
				res.status(200);
				body = `New player record created with userId ${playerId} and Object ID ${player.insertedId}`;
			}
			else
			{
				res.status(400);
				body = 'Error inserting new player record: Unable to insert with given request data';
			}
		}

		return res.send(body);
	},

	read: async (req: Request, res: Response) =>
	{
		const playerId = parseInt(req.params.id);
		const player = await getPlayer(playerId);
		let body: any = null;

		if (player == null)
		{
			res.status(404);
			body = `Player with ID ${playerId} not found`;
			debug(`Requested player record not found. ID ${playerId}`);
		}
		else
		{
			res.status(200);
			body = player;
			debug(`Requested player found! Retrieved record for player with ID ${playerId}`);
		}

		return res.send(body);
	},

	update: async (req: Request, res: Response) =>
	{
		const playerId = parseInt(req.params.id);
		const update = req.body;

		const result = await updatePlayer(playerId, update);

		let body: any = null;

		if (result.modifiedCount < 1)
		{
			res.status(400);
			body = 'Error updating player information: No documents modified';
		}
		else
		{
			res.status(200);
			body = 'Player record updated!';
		}

		return res.send(body);
	},

	delete: async (req: Request, res: Response) =>
	{
		const playerId = parseInt(req.params.id);
		let body: any = null;

		const result = await deletePlayer(playerId);

		if (result.deletedCount > 0)
		{
			res.status(200);
			body = `Player with ID ${playerId} deleted`;
		}
		else
		{
			res.status(404);
			body = `Unable to delete player with ID ${playerId}`;
		}
		
		return res.send(body);
	}
}