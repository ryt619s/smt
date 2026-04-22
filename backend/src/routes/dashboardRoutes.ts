import { Router } from 'express';
import { getMyTeam } from '../controllers/mlmController';
import { purchasePackage, getActivePackages, getPackages } from '../controllers/miningController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/team', getMyTeam);
router.get('/mining/available', getPackages);
router.get('/mining/packages', getActivePackages);
router.post('/mining/purchase', purchasePackage);

export default router;
