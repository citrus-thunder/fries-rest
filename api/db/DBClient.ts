import Debug from 'debug';
import { MongoClient, ObjectId } from 'mongodb';
import config from '../config/config.js';

const debug = Debug('fries-rest:db:client');

namespace DB
{
	export class DBClient
	{
		private client: MongoClient | null = null;
		public url: string = '';

		constructor(url: string)
		{
			this.url = url;
		}

		public static async connect(url: string, callback?: Function) : Promise<MongoClient | null>
		{
			let db = new DBClient(url);
			return await db.connect(callback);
		}

		public async connect(callback?: Function) : Promise<MongoClient>
		{
			if (this.client)
			{
				if (callback)
				{
					callback();
				}
				return this.client;
			}

			let c = await MongoClient.connect(this.url);
			if (callback)
			{
				callback();
			}

			return c;
		}

		public async getClient() : Promise<MongoClient>
		{
			// todo: We want to be sure this detects dropped/interrupted connections and 
			// attempts to repair it. A simple truthiness check on this.client probably doesn't
			// suffice.
			if (this.client)
			{
				return this.client;
			}
			else
			{
				return await this.connect();
			}
		}

		public async close() : Promise<void>
		{
			await this.client?.close();
		}
	}
}

export default DB.DBClient;