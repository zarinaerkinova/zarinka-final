import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/Category.js';
import { auth } from '../middleware/auth.js';
import onlyAdmins from '../middleware/onlyAdmins.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', auth, onlyAdmins, createCategory);
router.put('/:id', auth, onlyAdmins, updateCategory);
router.delete('/:id', auth, onlyAdmins, deleteCategory);

export default router; 