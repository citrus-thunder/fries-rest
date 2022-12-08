import express, { Request, NextFunction } from 'express';
import passport from '../config/passport-config.js';

import controller from '../controllers/item.js';

const router = express.Router();
const auth = passport.authenticate('jwt', { session: false });

router.route('/new')
	.post(auth, controller.create);

router.route('/:id')
	.get(auth, controller.read)
	.put(auth, controller.update)
	.delete(auth, controller.delete);

export default router;