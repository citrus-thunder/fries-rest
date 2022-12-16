import express, { Request, Response, NextFunction } from 'express';
import { WithId, Document, UpdateResult, InsertOneResult, DeleteResult, UpdateOptions } from 'mongodb';
import Debug from 'debug';

import Config from '../config/config.js';
import mdb from '../util/mdb.js';

const debug = Debug('fries-rest:controller:CrudController');

type CreateFunc = (data: object) => Promise<InsertOneResult>;
type ReadFunc = (id: any) => Promise<WithId<Document> | null>;
type UpdateFunc = (id: any, data: object) => Promise<UpdateResult>;
type DeleteFunc = (id: any) => Promise<DeleteResult>;

const client = await mdb.getClient();
const db = client.db(Config.db.name);

/**
 * Simple CRUD Controller utility
 */
export default class CrudController
{
	private _createFunc: CreateFunc;
	private _readFunc: ReadFunc;
	private _updateFunc: UpdateFunc;
	private _deleteFunc: DeleteFunc;

	private _collectionName: string;
	private _identityField: string;

	constructor(collectionName: string, identityField: string = '_id')
	{
		this._collectionName = collectionName;
		this._identityField = identityField;

		this._createFunc = async (data: object): Promise<InsertOneResult> =>
		{
			return await db.collection(this._collectionName).insertOne(data);
		};

		this._readFunc = async (id: any): Promise<WithId<Document> | null> =>
		{
			const filter: any = {};
			filter[this._identityField] = id;
	
			return await db.collection(this._collectionName).findOne(filter);
		};

		this._updateFunc = async (id: any, data: object): Promise<UpdateResult> =>
		{
			const options: UpdateOptions =
			{
				upsert: false
			};
	
			const filter: any = {};
			filter[this._identityField] = id;
	
			return await db.collection(this._collectionName).updateOne(filter, {$set: data}, options);
		};

		this._deleteFunc = async (id: any): Promise<DeleteResult> =>
		{
			const filter: any = {};
			filter[this._identityField] = id;

			return await db.collection(this._collectionName).deleteOne(filter);
		};

	}

	public setCreate = (createFunc: CreateFunc) : CrudController =>
	{
		this._createFunc = createFunc;
		return this;
	}

	public setRead = (readFunc: ReadFunc) : CrudController =>
	{
		this._readFunc = readFunc;
		return this;
	}

	public setUpdate = (updateFunc: UpdateFunc) : CrudController =>
	{
		this._updateFunc = updateFunc;
		return this;
	}

	public setDelete = (deleteFunc: DeleteFunc) : CrudController =>
	{
		this._deleteFunc = deleteFunc;
		return this;
	}

	public create = async (req: Request, res: Response, next: NextFunction) =>
	{
		const recordId = parseInt(req.params.id);
		let body: any = null;

		const existingRecord = await this._readFunc(recordId);

		if (existingRecord != null)
		{
			res.status(409);
			body = `Cannot create new record for collection "${this._collectionName}". Record with ID ${recordId} already exists!`;
		}
		else
		{
			const record = await this._createFunc(req.body);
			if (record.insertedId)
			{
				res.status(200);
				body = `New record created in collection "${this._collectionName}"`;
			}
			else
			{
				res.status(400);
				body = `Error inserting new record into collection "${this._collectionName}"`;
			}
		}

		return res.send(body);
	}

	public read = async (req: Request, res: Response, next: NextFunction) =>
	{
		const recordId = parseInt(req.params.id);
		const record = await this._readFunc(recordId);
		let body: any = null;

		if (record == null)
		{
			res.status(404);
			body = `Record with ID {${this._identityField}: ${recordId}} from collection "${this._collectionName} not found"`;
			debug(`Unable to find record with ID {${this._identityField}: ${recordId}} from collection ${this._collectionName}`);
		}
		else
		{
			res.status(200);
			body = record;
			debug(`Record Found! Retrieved record with ID {${this._identityField}: ${recordId}} from collection ${this._collectionName}`);
		}

		return res.send(body);
	}

	public update = async (req: Request, res: Response, next: NextFunction) =>
	{
		const recordId = parseInt(req.params.id);
		const update = req.body;
		let body: any = null;

		const existingRecord = await this._readFunc(recordId);
		if (existingRecord == null)
		{
			res.status(404);
			body = `Error updating record. No record found with id {${this._identityField}: ${recordId}} in collection "${this._collectionName}"`;
			debug(body)
			return res.send(body);
		}

		const result = await this._updateFunc(recordId, update);

		if (result.modifiedCount < 1)
		{
			res.status(400);
			body = `Error updating record with ID {${this._identityField}: ${recordId}} from collection "${this._collectionName}". No records modified`;
			debug(body);
		}
		else
		{
			res.status(200);
			body = `Updated record with ID {${this._identityField}: ${recordId}} from collection "${this._collectionName}"`;
			debug(body);
		}

		return res.send(body);
	}

	public delete = async (req: Request, res: Response, next: NextFunction) =>
	{
		const recordId = parseInt(req.params.id);
		let body: any = null;

		const existingRecord = await this._readFunc(recordId);
		if (existingRecord == null)
		{
			res.status(404);
			body = `Error deleting record. No record found with id {${this._identityField}: ${recordId}} in collection "${this._collectionName}"`;
			debug(body)
			return res.send(body);
		}

		const result = await this._deleteFunc(recordId);

		if (result.deletedCount > 0)
		{
			res.status(200);
			body = `Record with ID {${this._identityField}: ${recordId}} from collection "${this._collectionName}" deleted;`
		}
		else
		{
			res.status(500);
			body = `Unknown error encountered attempting to delete record with ID {${this._identityField}: ${recordId}} from collection "${this._collectionName}"`;
		}

		return res.send(body);
	}
}