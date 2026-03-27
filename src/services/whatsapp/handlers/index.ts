import { IntentHandler } from './base';
import { SaleHandler } from './saleHandler';
import { InventoryHandler, StockUpdateHandler } from './inventoryHandler';
import { ExpenseHandler } from './expenseHandler';
import { RevenueHandler, RevenueSummaryHandler, ReportHandler } from './revenueHandler';
import { CustomerHandler, LoyaltyHandler, PromoHandler } from './customerHandler';
import { AdviceHandler, DebtHandler, DebtCheckHandler } from './adviceHandler';
import { VoidHandler, ProductHandler } from './systemHandlers';
import { ReceiptHandler } from './receiptHandler';

class HandlerRegistry {
    private handlers: Map<string, IntentHandler> = new Map();

    constructor() {
        this.register(new SaleHandler());
        this.register(new InventoryHandler());
        this.register(new StockUpdateHandler());
        this.register(new ExpenseHandler());
        this.register(new RevenueHandler());
        this.register(new RevenueSummaryHandler());
        this.register(new ReportHandler());
        this.register(new CustomerHandler());
        this.register(new LoyaltyHandler());
        this.register(new PromoHandler());
        this.register(new AdviceHandler());
        this.register(new DebtHandler());
        this.register(new DebtCheckHandler());
        this.register(new VoidHandler());
        this.register(new ProductHandler());
        this.register(new ReceiptHandler());
    }

    private register(handler: IntentHandler) {
        this.handlers.set(handler.intent, handler);
    }

    getHandler(intent: string): IntentHandler | undefined {
        return this.handlers.get(intent);
    }
}

export const registry = new HandlerRegistry();

export { SaleHandler, ExpenseHandler, PromoHandler, VoidHandler };
