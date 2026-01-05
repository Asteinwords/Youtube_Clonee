import express from 'express';
import { getTheme } from '../controllers/themeController.js';

const router = express.Router();

router.get('/', getTheme);

export default router;
