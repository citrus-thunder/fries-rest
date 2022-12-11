import express, { Request, Response } from 'express';
import { WithId, Document, UpdateResult, InsertOneResult, DeleteResult, UpdateOptions } from 'mongodb';
import Debug from 'debug';

import Config from '../config/config.js';
import Client from '../util/mdb.js';

const debug = Debug('fries-rest:controller:item');

// todo: We will be moving shared CRUD controller logic to its own
// class. For now the bulk of this file is using copied boilerplate
// while we test basic CRUD functionality.

const client = await Client.getClient();
const db = client.db(Config.db.name);

async function createItem(data: object) : Promise<InsertOneResult>
{
	return await db.collection('items').insertOne(data);
}

async function getItem(itemId: number) : Promise<WithId<Document> | null>
{
	return await db.collection('items').findOne({itemId: itemId});
}

async function updateItem(itemId: number, data: object) : Promise<UpdateResult>
{
	const options: UpdateOptions =
	{
		upsert: false
	};

	return await db.collection('items').updateOne({itemId: itemId}, {$set: data}, options);
}

async function deleteItem(itemId: number) : Promise<DeleteResult>
{
	return await db.collection('items').deleteOne({itemId: itemId});
}

export default
{
	create: async (req: Request, res: Response) =>
	{
		const itemId = parseInt(req.params.id);
		let body: any = null;

		const existingItem = await getItem(itemId);

		if (existingItem != null)
		{
			res.status(409);
			body = `Cannot create new item record: Record with ID ${itemId} already exists!`;
		}
		else
		{
			const item = await createItem(req.body);
			if (item.insertedId)
			{
				res.status(200);
				body = `New item record created with itemId ${itemId} and Object ID ${item.insertedId}`;
			}
			else
			{
				res.status(400);
				body = `Error inserting new item record: Unable to insert with given request data`;
			}
		}

		return res.status(200);
	},

	read: async (req: Request, res: Response) =>
	{
		const itemId = parseInt(req.params.id);
		const item = await getItem(itemId);
		let body: any = null;

		if (item == null)
		{
			res.status(404);
			body = `Item with ID ${itemId} not found`;
			debug(`Requested item record not found. ID ${itemId}`);
		}
		else
		{
			res.status(200);
			body = item;
			debug(`Requested item found! Retrieved record for item with ID ${itemId}`);
		}

		return res.send(body);
	},

	update: async (req: Request, res: Response) =>
	{
		const itemId = parseInt(req.params.id);
		const update = req.body;

		const result = await updateItem(itemId, update);

		let body: any = null;

		if (result.modifiedCount < 1)
		{
			res.status(400);
			body = 'Error updating item information: No documents modified';
		}
		else
		{
			res.status(200);
			body = 'Item record updated!';
		}

		return res.send(body);
	},

	delete: async (req: Request, res: Response) =>
	{
		const itemId = parseInt(req.params.id);
		let body: any = null;

		const result = await deleteItem(itemId);

		if (result.deletedCount > 0)
		{
			res.status(200);
			body = `Item with ID ${itemId} deleted`;
		}
		else
		{
			res.status(404);
			body = `Unable to delete item with ID ${itemId}`;
		}
		
		return res.send(body);
	}
}