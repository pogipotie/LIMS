import { Injectable } from '@angular/core';
import { LivestockService } from './livestock.service';
import { TransactionService } from './transaction.service';
import { LogbookService } from './logbook.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private livestockService: LivestockService,
    private transactionService: TransactionService,
    private logbookService: LogbookService
  ) {}

  async generateMonthlyReport(year: number, month: number): Promise<any> {
    const transactions = await this.transactionService.getAll();
    const livestock = await this.livestockService.getAll();

    // Filter transactions for the specific month/year
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const reportData = {
      year,
      month,
      totalLivestock: livestock.filter(l => l.status === 'active').length,
      metrics: {
        births: 0,
        purchases: 0,
        sales: 0,
        deaths: 0,
        transfersIn: 0,
        transfersOut: 0
      },
      transactions: monthlyTransactions
    };

    monthlyTransactions.forEach(t => {
      if (t.type === 'birth') reportData.metrics.births++;
      if (t.type === 'purchase') reportData.metrics.purchases++;
      if (t.type === 'sale') reportData.metrics.sales++;
      if (t.type === 'death') reportData.metrics.deaths++;
      if (t.type === 'transfer_in') reportData.metrics.transfersIn++;
      if (t.type === 'transfer_out') reportData.metrics.transfersOut++;
    });

    return reportData;
  }

  async generateCustodianReport(period: 'weekly' | 'monthly'): Promise<any> {
    const logbooks = await this.logbookService.getAll();
    const livestock = await this.livestockService.getAll();

    const now = new Date();
    let startDate = new Date();
    
    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const filteredLogbooks = logbooks.filter(l => new Date(l.log_date) >= startDate && new Date(l.log_date) <= now);
    
    const activeCount = livestock.filter(l => l.status === 'active').length;
    const sickCount = filteredLogbooks.filter(l => l.health_status === 'sick' || l.health_status === 'injured').length;

    return {
      period,
      startDate,
      endDate: now,
      totalLivestock: activeCount,
      sickCount,
      logbooks: filteredLogbooks
    };
  }

  async exportCustodianPDF(reportData: any) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const periodName = reportData.period === 'weekly' ? 'Weekly' : 'Monthly';
    
    // Title
    doc.setFontSize(18);
    doc.text(`Custodian Health & Activity Report (${periodName})`, 14, 22);

    // Subtitle Date Range
    doc.setFontSize(10);
    const startStr = new Date(reportData.startDate).toLocaleDateString();
    const endStr = new Date(reportData.endDate).toLocaleDateString();
    doc.text(`Period: ${startStr} to ${endStr}`, 14, 30);

    // Summary section
    doc.setFontSize(12);
    doc.text(`Assigned Animals: ${reportData.totalLivestock}`, 14, 40);
    doc.text(`Health Alerts (Sick/Injured) This Period: ${reportData.sickCount}`, 14, 48);

    // Logbooks Table
    doc.text('Health Logbook Entries', 14, 60);

    const logBody = reportData.logbooks.map((l: any) => [
      new Date(l.log_date).toLocaleDateString(),
      l.livestock?.tag_number || 'N/A',
      l.record_type || 'Routine Check',
      l.health_status.toUpperCase(),
      l.weight_kg ? `${l.weight_kg} kg` : '-',
      l.treatment || '-',
      l.remarks || ''
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Tag No', 'Type', 'Status', 'Weight', 'Treatment', 'Remarks']],
      body: logBody,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] } // Primary color
    });

    // Save PDF
    doc.save(`LIMS_Custodian_${periodName}_Report_${endStr.replace(/\//g, '-')}.pdf`);
  }

  async exportToPDF(reportData: any) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const monthName = new Date(reportData.year, reportData.month).toLocaleString('default', { month: 'long' });

    // Title
    doc.setFontSize(18);
    doc.text(`LIMS Monthly Report: ${monthName} ${reportData.year}`, 14, 22);

    // Summary section
    doc.setFontSize(12);
    doc.text(`Current Active Inventory: ${reportData.totalLivestock}`, 14, 32);
    
    // Metrics table
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Count']],
      body: [
        ['Births', reportData.metrics.births],
        ['Purchases', reportData.metrics.purchases],
        ['Transfers In', reportData.metrics.transfersIn],
        ['Sales', reportData.metrics.sales],
        ['Deaths', reportData.metrics.deaths],
        ['Transfers Out', reportData.metrics.transfersOut]
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] } // Primary color
    });

    // Transactions Table
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.text('Transaction Details', 14, finalY + 15);

    const txBody = reportData.transactions.map((t: any) => [
      new Date(t.transaction_date).toLocaleDateString(),
      t.livestock?.tag_number || 'N/A',
      t.type.replace('_', ' ').toUpperCase(),
      t.amount ? `PHP ${t.amount.toFixed(2)}` : '-',
      t.notes || ''
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Date', 'Livestock Tag', 'Type', 'Amount', 'Notes']],
      body: txBody,
      theme: 'striped'
    });

    // Save PDF
    doc.save(`LIMS_Report_${monthName}_${reportData.year}.pdf`);
  }
}
