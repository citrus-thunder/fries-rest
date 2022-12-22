import Debug from 'debug';

import config from '../config/config.js';
import DB from '../db/DBClient.js';

const debug = Debug('fries-rest:mdb');

let client: DB = new DB(config.db.url);

export default client;