import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth-routing.module').then(m => m.AuthRoutingModule) },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard-routing.module').then(m => m.DashboardRoutingModule), canActivate: [AuthGuard] },
  { path: 'livestock', loadChildren: () => import('./features/livestock/livestock-routing.module').then(m => m.LivestockRoutingModule), canActivate: [AuthGuard] },
  { path: 'transactions', loadChildren: () => import('./features/transactions/transaction-routing.module').then(m => m.TransactionRoutingModule), canActivate: [AuthGuard] },
  { path: 'inventory', loadChildren: () => import('./features/inventory/inventory-routing.module').then(m => m.InventoryRoutingModule), canActivate: [AuthGuard] },
  { path: 'reports', loadChildren: () => import('./features/reports/report-routing.module').then(m => m.ReportRoutingModule), canActivate: [AuthGuard] },
  { path: 'data-management', loadChildren: () => import('./features/data-management/data-management-routing.module').then(m => m.DataManagementRoutingModule), canActivate: [AuthGuard] },
  { path: 'categories', loadChildren: () => import('./features/categories/categories-routing.module').then(m => m.CategoriesRoutingModule), canActivate: [AuthGuard] },
  { path: 'settings', loadChildren: () => import('./features/settings/settings-routing.module').then(m => m.SettingsRoutingModule), canActivate: [AuthGuard] },
  { path: 'custodians', loadChildren: () => import('./features/custodians/custodians-routing.module').then(m => m.CustodiansRoutingModule), canActivate: [AuthGuard] },
  { path: 'logbooks', loadChildren: () => import('./features/logbooks/logbooks-routing.module').then(m => m.LogbooksRoutingModule), canActivate: [AuthGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
