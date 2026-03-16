import { OrderService, Order } from './orderService';
import { logger } from '@/lib/logger';

const QUEUE_KEY = 'solosme_pos_queue';

export class POSQueueService {
    /**
     * Queues a transaction for later syncing
     */
    static queueTransaction(orderData: Partial<Order>): void {
        try {
            const queue = this.getQueue();
            queue.push({
                ...orderData,
                tempId: crypto.randomUUID(),
                queuedAt: new Date().toISOString()
            });
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            logger.info('Transaction queued offline', { items: orderData.items?.length });
        } catch (error) {
            logger.error('Failed to queue transaction', error);
        }
    }

    /**
     * Gets all pending transactions
     */
    static getQueue(): any[] {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    /**
     * Attempts to sync all queued transactions
     */
    static async syncQueue(): Promise<{ success: number; failed: number }> {
        const queue = this.getQueue();
        if (queue.length === 0) return { success: 0, failed: 0 };

        let successCount = 0;
        let failedCount = 0;
        const remainingQueue: any[] = [];

        logger.info(`Starting sync for ${queue.length} transactions`);

        for (const transaction of queue) {
            try {
                // Remove temp fields before sending to API
                const { tempId, queuedAt, ...orderData } = transaction;
                const result = await OrderService.createOrder(orderData);

                if (result) {
                    successCount++;
                    logger.info('Synced offline transaction', { id: result.id });
                } else {
                    failedCount++;
                    remainingQueue.push(transaction);
                }
            } catch (error) {
                failedCount++;
                remainingQueue.push(transaction);
                logger.error('Sync failed for transaction', error);
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
        return { success: successCount, failed: failedCount };
    }

    /**
     * Clears the entire queue
     */
    static clearQueue(): void {
        localStorage.removeItem(QUEUE_KEY);
    }
}
