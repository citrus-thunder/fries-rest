import Debug from 'debug';

const debug = Debug('fries-rest:config');

const config =
{
	port: process.env.FRIES_REST_PORT || 5000,

	auth:
	{
		disabled: process.env.FRIES_REST_DISABLE_AUTH || false,
		clientSecret: process.env.FRIES_REST_CLIENT_SECRET || undefined
	},

	db:
	{
		url: process.env.FRIES_REST_MONGO_URL!,
		name: process.env.FRIES_REST_MONGO_DB!
	}
}

if (!(config.db.url && config.db.name))
{
	throw 'DB URL/Name must be provided';
}

if (config.auth.disabled)
{
	debug('Warning: Auth is disabled. Only use no-auth mode for testing!');
}

if (!config.auth.disabled && config.auth.clientSecret == undefined)
{
	throw 'Client Secret must be provided if auth is enabled';
}

export const auth = config.auth;

export const db = config.db;

export default config;