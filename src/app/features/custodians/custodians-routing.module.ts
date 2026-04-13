import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustodiansComponent } from './custodians.component';

const routes: Routes = [
  { path: '', component: CustodiansComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustodiansRoutingModule { }