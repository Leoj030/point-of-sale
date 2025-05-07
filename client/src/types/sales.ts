export interface SalesData {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface SalesReportResponse {
  success: boolean;
  data: SalesData;
  message?: string;
}
