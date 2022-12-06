const config =
{
	auth:
	{
		clientSecret: process.env.FRIES_REST_CLIENT_SECRET!
	},

	db:
	{
		url: process.env.FRIES_REST_MONGO_URL!,
		name: process.env.FRIES_REST_MONGO_NAME || 'fries-rest-dev'
	}
}

// todo: validate presence of required config items and throw if missing

export const auth = config.auth;

export const db = config.db;

export default config;