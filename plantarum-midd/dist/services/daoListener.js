//src/services/daoListener.ts
import { Contract, Interface } from "ethers";
import { provider } from "../utils/provider.js";
const DAO_ADDRESS = process.env.DAO_ADDRESS;
if (!DAO_ADDRESS)
    throw new Error("DAO_ADDRESS no definido en .env");
// ABI mínimo de eventos DAO
const DAO_ABI_EVENTS = new Interface([
    "event ProposalCreated(uint256 indexed id, address indexed author, string title, uint256 deadline)",
    "event VoteCast(address indexed voter, uint256 indexed id, bool support, uint256 weight)",
    "event ProposalExecuted(uint256 indexed id, bool passed)"
]);
const daoContract = new Contract(DAO_ADDRESS, DAO_ABI_EVENTS, provider);
/**
 * Consulta eventos históricos de la DAO (máx 100 bloques)
 */
export async function queryDaoEvents(fromBlock, toBlock) {
    try {
        const latest = await provider.getBlockNumber();
        const from = fromBlock ?? Math.max(0, latest - 100); // ✅ solo 100 bloques
        const to = toBlock ?? latest;
        const logs = await provider.getLogs({
            address: DAO_ADDRESS,
            fromBlock: from,
            toBlock: to
        });
        const decoded = logs.map((log) => {
            try {
                const parsed = DAO_ABI_EVENTS.parseLog(log);
                return {
                    blockNumber: log.blockNumber,
                    txHash: log.transactionHash,
                    event: parsed?.name,
                    args: parsed?.args
                };
            }
            catch {
                return {
                    blockNumber: log.blockNumber,
                    txHash: log.transactionHash,
                    raw: log
                };
            }
        });
        return { ok: true, fromBlock: from, toBlock: to, events: decoded };
    }
    catch (err) {
        console.error("[DAO Events] Error:", err.message);
        return { ok: false, error: err.message };
    }
}
/**
 * Suscripción live a eventos DAO
 */
export function startDaoLiveSubscription() {
    daoContract.on("ProposalCreated", (id, author, title, deadline, ev) => {
        console.log("[DAO] ProposalCreated:", {
            id: id.toString(),
            author,
            title,
            deadline: deadline.toString(),
            tx: ev.log.transactionHash
        });
    });
    daoContract.on("VoteCast", (voter, id, support, weight, ev) => {
        console.log("[DAO] VoteCast:", {
            voter,
            id: id.toString(),
            support,
            weight: weight.toString(),
            tx: ev.log.transactionHash
        });
    });
    daoContract.on("ProposalExecuted", (id, passed, ev) => {
        console.log("[DAO] ProposalExecuted:", {
            id: id.toString(),
            passed,
            tx: ev.log.transactionHash
        });
    });
    console.log("👂 Subscripción live a eventos DAO activa...");
}
