import express, { Request, Response, NextFunction } from 'express';
import { WithId, Document, UpdateResult, InsertOneResult, DeleteResult, UpdateOptions } from 'mongodb';
import Debug from 'debug';

import Config from '../config/config.js';
import mdb from '../util/mdb.js';

const debug = Debug('fries-rest:controller:CrudController');

type CreateFunc = (data: object) => Promise<InsertOneResult | undefined>;
type ReadFunc = (id: any) => Promise<WithId<Document> | null | undefined>;
type UpdateFunc = (id: any, data: object) => Promise<UpdateResult | undefined>;
type DeleteFunc = (id: any) => Promise<DeleteResult | undefined>;
type QueryFunc = (query: object, project?: object) => Promise<WithId<Document>[] | null | undefined>;

/**
 * Simple CRUD Controller utility
 */
export default class CrudController
{
	private _createFunc: CreateFunc;
	private _readFunc: ReadFunc;
	private _updateFunc: UpdateFunc;
	private _deleteFunc: DeleteFunc;
	private _queryFunc: QueryFunc;

	private _collectionName: string;
	private _identityField: string;

	constructor(collectionName: string, identityField: string = '_id')
	{
		this._collectionName = collectionName;
		this._identityField = identityField;

		this._createFunc = async (data: object): Promise<InsertOneResult | undefined> =>
		{
			const db = await this.getDb();

			return await db?.collection(this._collectionName).insertOne(data);
		};

		this._readFunc = async (id: any): Promise<WithId<Document> | null | undefined> =>
		{
			const db = await this.getDb();
			const filter: any = {};
			filter[this._identityField] = id;

			return await db?.collection(this._collectionName).findOne(filter);
		};

		this._updateFunc = async (id: any, data: object): Promise<UpdateResult | undefined> =>
		{
			const db = await this.getDb();
			const options: UpdateOptions =
			{
				upsert: false
			};

			const filter: any = {};
			filter[this._identityField] = id;

			return await db?.collection(this._collectionName).updateOne(filter, {$set: data}, options);
		};

		this._deleteFunc = async (id: any): Promise<DeleteResult | undefined> =>
		{
			const db = await this.getDb();
			const filter: any = {};
			filter[this._identityField] = id;

			return await db?.collection(this._collectionName).deleteOne(filter);
		};

		this._queryFunc = async (query: object, project?: object): Promise<WithId<Document>[] | null | undefined> =>
		{
			const db = await this.getDb();
			let result = db?.collection(this._collectionName).find(query);
			if (project && result)
				{
				result = result.project(project);
				}
			return await result?.toArray();
		}
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

	public setQuery = (queryFunc: QueryFunc) : CrudController =>
	{
		this._queryFunc = queryFunc;
		return this;
	}

	public create = async (req: Request, res: Response, next: NextFunction) =>
	{
		const recordId = parseInt(req.params.id);
		let body: any = null;

		const existingRecord = await this._readFunc(recordId);

		if (existingRecord === undefined)
		{
			return res
				.status(500)
				.send('Unexpected server error');
		}

		if (existingRecord != null)
		{
			res.status(409);
			body = `Cannot create new record for collection "${this._collectionName}". Record with ID ${recordId} already exists!`;
		}
		else
		{
			if (req.body[this._identityField] != req.params.id)
			{
				return res
					.status(400)
					.send('Error inserting record: Request ID param and record ID must match');
			}

			const record = await this._createFunc(req.body);
			if (record === undefined)
			{
				res.status(500);
				body = 'Unexpected server error';
			}
			else if (record.insertedId)
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

		if (record === undefined)
		{
			return res
				.status(500)
				.send('Unexpected server error');
		}

		if (record == null)
		{
			res.status(404);
			body = `Record with ID {${this._identityField}: ${recordId}} from collection "${this._collectionName}" not found`;
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
		if (existingRecord === undefined)
		{
			return res
				.status(500)
				.send('Unexpected server error');
		}

		if (existingRecord == null)
		{
			res.status(404);
			body = `Error updating record. No record found with id {${this._identityField}: ${recordId}} in collection "${this._collectionName}"`;
			debug(body)
			return res.send(body);
		}

		const result = await this._updateFunc(recordId, update);
		if (result === undefined)
		{
			res.status(500);
			body = 'Unexpected server error';
		}
		else if (result.modifiedCount < 1)
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
		if (existingRecord === undefined)
		{
			return res
				.status(500)
				.send('Unexpected server error');
		}

		if (existingRecord == null)
		{
			res.status(404);
			body = `Error deleting record. No record found with id {${this._identityField}: ${recordId}} in collection "${this._collectionName}"`;
			debug(body)
			return res.send(body);
		}

		const result = await this._deleteFunc(recordId);
		if (result === undefined)
		{
			res.status(500);
			body = 'Unexpected server error';
		}
		else if (result.deletedCount > 0)
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

	public query = async (req: Request, res: Response, next: NextFunction) =>
	{
		const query = req.body.query;
		const project = req.body.project;
		let body: any = null;

		const result = await this._queryFunc(query, project);
		if (result === undefined)
			{
			res.status(500);
			body = 'Unexpected server error';
			}
		else
			{
			res.status(200);
			body = result;
			}
		
		return res.send(body);
	}

	public getDb = async () =>
	{
		const client = await mdb.getClient();
		const db = client?.db(Config.db.name);
		return db;
	}
}