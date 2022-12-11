import express, { Request, Response } from 'express';
import { WithId, Document, UpdateResult, InsertOneResult, DeleteResult, UpdateOptions } from 'mongodb';
import Debug from 'debug';

import Config from '../config/config.js';
import Client from '../util/mdb.js';

const debug = Debug('fries-rest:controller:armor');

// todo: We will be moving shared CRUD controller logic to its own
// class. For now the bulk of this file is using copied boilerplate
// while we test basic CRUD functionality.

const client = await Client.getClient();
const db = client.db(Config.db.name);

async function createArmor(data: object) : Promise<InsertOneResult>
{
	return await db.collection('armor').insertOne(data);
}

async function getArmor(armorId: number) : Promise<WithId<Document> | null>
{
	return await db.collection('armor').findOne({armorId: armorId});
}

async function updateArmor(armorId: number, data: object) : Promise<UpdateResult>
{
	const options: UpdateOptions =
	{
		upsert: false
	};

	return await db.collection('armor').updateOne({armorId: armorId}, {$set: data}, )
}

async function deleteArmor(armorId: number) : Promise<DeleteResult>
{
	return await db.collection('armor').deleteOne({armorId: armorId});
}

export default
{
	create: async (req: Request, res: Response) =>
	{
		const armorId = parseInt(req.params.id);
		let body: any = null;

		const existingArmor = await getArmor(armorId);

		if (existingArmor != null)
		{
			res.status(409);
			body = `Cannot create new armor record: Record with ID ${armorId} already exists!`;
		}
		else
		{
			const armor = await createArmor(req.body);
			if (armor.insertedId)
			{
				res.status(200);
				body = `New armor record created with userId ${armorId} and Object ID ${armor.insertedId}`;
			}
			else
			{
				res.status(400);
				body = 'Error inserting new armor record: Unable to insert with given request data';
			}
		}

		return res.send(body);
	},

	read: async (req: Request, res: Response) =>
	{
		const armorId = parseInt(req.params.id);
		const armor = await getArmor(armorId);
		let body: any = null;

		if (armor == null)
		{
			res.status(404);
			body = `Armor with ID ${armorId} not found`;
			debug(`Requested armor record not found. ID ${armorId}`);
		}
		else
		{
			res.status(200);
			body = armor;
			debug(`Requested armor found! Retrieved record for armor with ID ${armorId}`);
		}

		return res.send(body);
	},

	update: async (req: Request, res: Response) =>
	{
		const armorId = parseInt(req.params.id);
		const update = req.body;

		const result = await updateArmor(armorId, update);

		let body: any = null;

		if (result.modifiedCount < 1)
		{
			res.status(400);
			body = 'Error updating armor information: No documents modified';
		}
		else
		{
			res.status(200);
			body = 'Armor record updated!';
		}

		return res.send(body);
	},

	delete: async (req: Request, res: Response) =>
	{
		const armorId = parseInt(req.params.id);
		let body: any = null;

		const result = await deleteArmor(armorId);

		if (result.deletedCount > 0)
		{
			res.status(200);
			body = `Armor with ID ${armorId} deleted`;
		}
		else
		{
			res.status(404);
			body = `Unable to delete armor with ID ${armorId}`;
		}
		
		return res.send(body);
	}
}