import express from 'express';
import Debug from 'debug';
import morgan from 'morgan';

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
	.use('/api/player', playerRouter)
	.use('/api/item', itemRouter)
	.use('/api/armor', armorRouter)
	.use('/api/weapon', weaponRouter)
	.use('/api/monster', monsterRouter)

	// Other Routes
	.get('/', (req, res) =>
	{
		res
			.status(200)
			.send('API is here and listening!');
	});

db.connect(() =>
{
	app.listen(config.port, () =>
	{
		debug(`Server listening on port ${config.port}`);
	})
})