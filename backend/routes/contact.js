import express from 'express';
const router = express.Router();
import { sendContactMessage } from '../controllers/contact.js';

router.post('/', sendContactMessage);

export default router;
