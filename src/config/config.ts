const config =
{
	port: process.env.FRIES_REST_PORT || 5000,

	auth:
	{
		clientSecret: process.env.FRIES_REST_CLIENT_SECRET!
	},

	db:
	{
		url: process.env.FRIES_REST_MONGO_URL!,
		name: process.env.FRIES_REST_MONGO_DB || 'fries-rest-test'
	}
}

// todo: validate presence of required config items and throw if missing

export const auth = config.auth;

export const db = config.db;

export default config;