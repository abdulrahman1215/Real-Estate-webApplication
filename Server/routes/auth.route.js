import { sign } from 'crypto';
import express from 'express';
import { google, signup, signin } from '../controllers/auth.controller.js';
import router from './user.route.js';

const route = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
route.post('/google' , google);

export default router;