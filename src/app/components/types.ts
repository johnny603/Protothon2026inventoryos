export type ItemStatus = 'available' | 'checked-out' | 'overdue' | 'damaged' | 'lost';
export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
export type UserRole = 'equipment-manager' | 'coach' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restricted: boolean;
  repeatOffender: boolean;
}

export interface Item {
  id: string;
  barcode: string;
  name: string;
  category: string;
  status: ItemStatus;
  condition: ItemCondition;
  currentHolder?: string;
  dueDate?: Date;
  checkoutDate?: Date;
  lastSeenWith?: string;
}

export interface HistoryEntry {
  id: string;
  itemId: string;
  userId: string;
  action: 'checkout' | 'return' | 'damage-report' | 'lost-report';
  timestamp: Date;
  condition?: ItemCondition;
  notes?: string;
}
