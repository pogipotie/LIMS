import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonthlyReportComponent } from './pages/monthly-report/monthly-report.component';

const routes: Routes = [
  { path: '', component: MonthlyReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
