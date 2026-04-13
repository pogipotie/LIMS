import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventorySummaryComponent } from './pages/inventory-summary/inventory-summary.component';

const routes: Routes = [
  { path: '', component: InventorySummaryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
