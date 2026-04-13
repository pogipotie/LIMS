import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LivestockListComponent } from './pages/livestock-list/livestock-list.component';
import { AddLivestockComponent } from './pages/add-livestock/add-livestock.component';

const routes: Routes = [
  { path: '', component: LivestockListComponent },
  { path: 'add', component: AddLivestockComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LivestockRoutingModule { }
