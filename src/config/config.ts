const config =
{
	auth:
	{
		clientSecret: process.env.FRIES_REST_CLIENT_SECRET!
	}
}

// todo: calidate presence of required config items and throw if missing

export const auth = config.auth;

export default config;