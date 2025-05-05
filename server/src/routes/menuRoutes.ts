import express from 'express';
import { getCategories, getProducts } from '../controllers/pages/menu.ts';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/products', getProducts);

export default router;