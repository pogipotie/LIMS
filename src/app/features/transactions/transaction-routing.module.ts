import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionListComponent } from './pages/transaction-list/transaction-list.component';
import { AddTransactionComponent } from './pages/add-transaction/add-transaction.component';

const routes: Routes = [
  { path: '', component: TransactionListComponent },
  { path: 'add', component: AddTransactionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionRoutingModule { }
