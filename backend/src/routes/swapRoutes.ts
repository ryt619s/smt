import { Router } from 'express';
import { swapTokens, getPrice } from '../controllers/swapController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/price', getPrice);
router.post('/', swapTokens);

export default router;
