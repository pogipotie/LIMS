import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngClass]="type">
      <ng-container *ngIf="type === 'table'">
        <div class="skeleton-header"></div>
        <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]">
          <div class="skeleton-cell" style="flex: 2"></div>
          <div class="skeleton-cell" style="flex: 3"></div>
          <div class="skeleton-cell" style="flex: 1"></div>
          <div class="skeleton-cell" style="flex: 1"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="type === 'card'">
        <div class="skeleton-card-icon"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-line title"></div>
          <div class="skeleton-line value"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="type === 'timeline'">
        <div class="skeleton-timeline-item" *ngFor="let i of [1,2,3]">
          <div class="skeleton-timeline-icon"></div>
          <div class="skeleton-timeline-content">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line text"></div>
            <div class="skeleton-line text short"></div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      width: 100%;
    }

    /* Animation */
    @keyframes pulse {
      0% { background-color: #f0f0f0; }
      50% { background-color: #e0e0e0; }
      100% { background-color: #f0f0f0; }
    }

    .skeleton-line, .skeleton-header, .skeleton-cell, .skeleton-card-icon, .skeleton-timeline-icon {
      animation: pulse 1.5s infinite ease-in-out;
      border-radius: 4px;
    }

    /* Table Skeleton */
    .table {
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .skeleton-header {
      height: 48px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #eee;
    }
    .skeleton-row {
      display: flex;
      padding: 16px;
      gap: 16px;
      border-bottom: 1px solid #f9f9f9;
    }
    .skeleton-cell {
      height: 20px;
    }

    /* Card Skeleton */
    .card {
      display: flex;
      align-items: center;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      background: white;
    }
    .skeleton-card-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin-right: 20px;
    }
    .skeleton-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .skeleton-line.title { height: 16px; width: 60%; }
    .skeleton-line.value { height: 32px; width: 40%; margin-top: 4px; }

    /* Timeline Skeleton */
    .timeline {
      padding: 10px;
    }
    .skeleton-timeline-item {
      display: flex;
      margin-bottom: 24px;
      position: relative;
    }
    .skeleton-timeline-item::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 40px;
      bottom: -24px;
      width: 2px;
      background-color: #f0f0f0;
    }
    .skeleton-timeline-item:last-child::before { display: none; }
    .skeleton-timeline-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 20px;
      z-index: 1;
    }
    .skeleton-timeline-content {
      flex: 1;
      background: white;
      border: 1px solid #f0f0f0;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .skeleton-line.text { height: 14px; width: 90%; }
    .skeleton-line.short { width: 50%; }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'table' | 'card' | 'timeline' = 'table';
}
