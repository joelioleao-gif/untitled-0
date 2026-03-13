export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'more_info';

export interface InvestmentRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  subCategory: string;
  site: string;
  pickingType: string;
  executingTeam: string;
  requester: {
    name: string;
    email: string;
  };
  status: RequestStatus;
  inPlan: boolean;
  createdAt: string;
  updatedAt: string;
  approver?: {
    name: string;
    email: string;
  };
  comments?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'requester' | 'approver' | 'admin';
}
