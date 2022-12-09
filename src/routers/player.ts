import express, { Request, Response, NextFunction } from 'express';
import passport from '../config/passport-config.js';

import controller from '../controllers/player.js';

const router = express.Router();
//const auth = passport.authenticate('jwt', { session: false });

//test auth
const auth = async (req: Request, res: Response, done: Function) => {done(null, false)};

router.route('/:id')
	.post(auth, controller.create)
	.get(auth, controller.read)
	.put(auth, controller.update)
	.delete(auth, controller.delete);

export default router;