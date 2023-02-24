import Debug from 'debug';
import { MongoClient, MongoClientOptions, MongoServerSelectionError, ObjectId } from 'mongodb';
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

		public async connect(callback?: Function) : Promise<MongoClient | null>
		{
			if (this.client)
			{
				if (callback)
				{
					callback();
				}
				return this.client;
			}

			let res: MongoClient | null = null;
			const options: MongoClientOptions =
			{
				serverSelectionTimeoutMS: 5000,
				connectTimeoutMS: 5000
			};

			try
			{
				res = await MongoClient.connect(this.url, options);
				if (callback)
				{
					callback();
				}
			}
			catch (ex)
			{
				debug('Error connecting to Mongo instance. Check that the connection string is correct and that mongo is running' + ex);
				return null;
			}

			return res;
		}

		public async getClient() : Promise<MongoClient | null>
		{
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