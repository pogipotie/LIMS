import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogbooksComponent } from './logbooks.component';

const routes: Routes = [
  { path: '', component: LogbooksComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogbooksRoutingModule { }