import { Injectable } from '@angular/core';
import { LivestockService } from './livestock.service';
import { TransactionService } from './transaction.service';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(
    private livestockService: LivestockService,
    private transactionService: TransactionService
  ) {}

  async calculateEndingInventory(): Promise<{
    beginningInventory: number,
    births: number,
    purchases: number,
    transfersIn: number,
    sales: number,
    deaths: number,
    transfersOut: number,
    endingInventory: number
  }> {
    // Run both queries concurrently instead of sequentially to cut network wait time in half
    const [livestock, transactions] = await Promise.all([
      this.livestockService.getAll(),
      this.transactionService.getAll()
    ]);

    // Beginning inventory is the total registered livestock (assuming pre-loaded).
    let beginningInventory = livestock.length;
    
    let births = 0;
    let purchases = 0;
    let transfersIn = 0;
    let sales = 0;
    let deaths = 0;
    let transfersOut = 0;

    for (const t of transactions) {
      if (t.type === 'birth') births++;
      if (t.type === 'purchase') purchases++;
      if (t.type === 'transfer_in') transfersIn++;
      if (t.type === 'sale') sales++;
      if (t.type === 'death') deaths++;
      if (t.type === 'transfer_out') transfersOut++;
    }

    // Formula: Beginning + Births + Purchases + Transfers In - Sales - Deaths - Transfers Out
    const endingInventory = beginningInventory + births + purchases + transfersIn - sales - deaths - transfersOut;
    
    return {
      beginningInventory,
      births,
      purchases,
      transfersIn,
      sales,
      deaths,
      transfersOut,
      endingInventory
    };
  }
}
