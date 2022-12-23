import express, {Express} from 'express';
import Debug from 'debug';
import morgan from 'morgan';
import type http from 'http';

import config from './config/config.js';
import db from './util/mdb.js';

// Routers
import playerRouter from './routers/player.js';
import itemRouter from './routers/item.js';
import armorRouter from './routers/armor.js';
import weaponRouter from './routers/weapon.js';
import monsterRouter from './routers/monster.js';

const app = express();
const debug = Debug('fries-rest:core');

app
	// Imported Middleware
	.use(morgan('tiny'))
	.use(express.json())
	.use(express.urlencoded({extended: true}))

	// Routers
	.use('/player', playerRouter)
	.use('/item', itemRouter)
	.use('/armor', armorRouter)
	.use('/weapon', weaponRouter)
	.use('/monster', monsterRouter)

	// Other Routes
	.get('/', (req, res) =>
	{
		res
			.status(200)
			.send('API is here and listening!');
	});

type API =
{
	app: Express,
	server: http.Server | null,
	start: () => Promise<void>
	stop: () => Promise<void>
};

const api: API =
{
	app: app,
	server: null,
	start: async function()
	{
		if (this.server)
		{
			return;
		}
		this.server = app.listen(config.port, () =>
		{
			debug(`Server listening on port ${config.port}`);
		});
	},

	stop: async function()
	{
		if (this.server != null)
		{
			this.server.close();
			this.server = null;
		}
	}
}

export default api;