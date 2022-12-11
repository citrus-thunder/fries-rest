import express, { Request, Response } from 'express';
import { WithId, Document, UpdateResult, InsertOneResult, DeleteResult, UpdateOptions } from 'mongodb';
import Debug from 'debug';

import Config from '../config/config.js';
import Client from '../util/mdb.js';

const debug = Debug('fries-rest:controller:weapon');

// todo: We will be moving shared CRUD controller logic to its own
// class. For now the bulk of this file is using copied boilerplate
// while we test basic CRUD functionality.

const client = await Client.getClient();
const db = client.db(Config.db.name);

async function createWeapon(data: object) : Promise<InsertOneResult>
{
	return await db.collection('weapons').insertOne(data);
}

async function getWeapon(weaponId: number) : Promise<WithId<Document> | null>
{
	return await db.collection('weapons').findOne({weaponId: weaponId});
}

async function updateWeapon(weaponId: number, data: object) : Promise<UpdateResult>
{
	const options: UpdateOptions =
	{
		upsert: false
	};

	return await db.collection('weapons').updateOne({weaponId: weaponId}, {$set: data}, options);
}

async function deleteWeapon(weaponId: number) : Promise<DeleteResult>
{
	return await db.collection('weapons').deleteOne({weaponId: weaponId});
}

export default
{
	create: async (req: Request, res: Response) =>
	{
		const weaponId = parseInt(req.params.id);
		let body: any = null;

		const existingWeapon = await getWeapon(weaponId);

		if (existingWeapon != null)
		{
			res.status(409);
			body = `Cannot create new weapon record: Record with ID ${weaponId} already exists!`;
		}
		else
		{
			const weapon = await createWeapon(req.body);
			if (weapon.insertedId)
			{
				res.status(200);
				body = `New weapon record created with userId ${weaponId} and Object ID ${weapon.insertedId}`;
			}
			else
			{
				res.status(400);
				body = 'Error inserting new weapon record: Unable to insert with given request data';
			}
		}

		return res.send(body);
	},

	read: async (req: Request, res: Response) =>
	{
		const weaponId = parseInt(req.params.id);
		const weapon = await getWeapon(weaponId);
		let body: any = null;

		if (weapon == null)
		{
			res.status(404);
			body = `Weapon with ID ${weaponId} not found`;
			debug(`Requested weapon record not found. ID ${weaponId}`);
		}
		else
		{
			res.status(200);
			body = weapon;
			debug(`Requested weapon found! Retrieved record for weapon with ID ${weaponId}`);
		}

		return res.send(body);
	},

	update: async (req: Request, res: Response) =>
	{
		const weaponId = parseInt(req.params.id);
		const update = req.body;

		const result = await updateWeapon(weaponId, update);

		let body: any = null;

		if (result.modifiedCount < 1)
		{
			res.status(400);
			body = 'Error updating weapon information: No documents modified';
		}
		else
		{
			res.status(200);
			body = 'Weapon record updated!';
		}

		return res.send(body);
	},

	delete: async (req: Request, res: Response) =>
	{
		const weaponId = parseInt(req.params.id);
		let body: any = null;

		const result = await deleteWeapon(weaponId);

		if (result.deletedCount > 0)
		{
			res.status(200);
			body = `Weapon with ID ${weaponId} deleted`;
		}
		else
		{
			res.status(404);
			body = `Unable to delete weapon with ID ${weaponId}`;
		}
		
		return res.send(body);
	}
}