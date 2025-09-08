//src/routes/daoEvents.ts
import { Router } from 'express';
import { queryDaoEvents } from '../services/daoListener.js';
const router = Router();
/**
 * GET /dao/events?fromBlock=NUM&toBlock=NUM
 */
router.get('/events', async (req, res) => {
    try {
        const fromBlock = req.query.fromBlock ? Number(req.query.fromBlock) : undefined;
        const toBlock = req.query.toBlock ? Number(req.query.toBlock) : undefined;
        const data = await queryDaoEvents(fromBlock, toBlock);
        res.json({ ok: true, data });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
export default router;
