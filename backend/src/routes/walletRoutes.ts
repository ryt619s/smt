import { Router } from 'express';
import { getWalletBalance, getTransactions } from '../controllers/walletController';
import { requestDeposit } from '../controllers/depositController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/balance', getWalletBalance);
router.get('/transactions', getTransactions);
router.post('/deposit/request', requestDeposit);

export default router;
