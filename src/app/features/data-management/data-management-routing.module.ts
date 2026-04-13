import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LivestockRecordsComponent } from './pages/livestock-records/livestock-records.component';

const routes: Routes = [
  { path: '', component: LivestockRecordsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataManagementRoutingModule { }
