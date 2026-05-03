export type ItemStatus = 'available' | 'checked-out' | 'overdue' | 'damaged' | 'lost';
export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
export type UserRole = 'equipment-manager' | 'coach' | 'student';
export type Permission = 'checkout' | 'bulk-checkout' | 'damage-log' | 'admin';
export type ItemKind = 'single' | 'bulk';
export type DamageLevel = 'none' | 'minor' | 'major' | 'unusable';
export type CheckoutStatus = 'active' | 'overdue' | 'returned';
export type NotificationChannel = 'email' | 'sms';
export type NotificationTrigger = 'approaching-due' | 'overdue' | 'damaged' | 'unusable';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

/** Basis used to compute the due date at checkout time. */
export type DueBasis = 'per-item' | 'per-category' | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Optional phone number for notifications */
  phone?: string;
  role: UserRole;
  roles: UserRole[];
  permissions: Permission[];
  groups: string[];
  active: boolean;
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
  kind: ItemKind;
  photoUrl: string;
  totalQuantity: number;
  availableQuantity: number;
  checkedOutQuantity: number;
  damagedQuantity: number;
  lostQuantity: number;
  damageLevel: DamageLevel;
  restockFlag: boolean;
  createdAt: Date;
  currentHolder?: string;
  dueDate?: Date;
  checkoutDate?: Date;
  lastSeenWith?: string;
  parentItemId?: string;
  /** Per-item loan duration override (days). Overrides global default when set. */
  defaultLoanDays?: number;
}

export interface HistoryEntry {
  id: string;
  itemId: string;
  userId?: string;
  action: 'scan' | 'checkout' | 'return' | 'damage-report' | 'lost-report' | 'split' | 'merge' | 'notification';
  timestamp: Date;
  condition?: ItemCondition;
  damageLevel?: DamageLevel;
  quantity?: number;
  notes?: string;
}

export interface Checkout {
  id: string;
  itemId: string;
  userId: string;
  quantity: number;
  checkoutDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  status: CheckoutStatus;
  /** Basis used to compute dueDate (for display/audit purposes). */
  dueBasis?: DueBasis;
}

export interface InventoryNotification {
  id: string;
  itemId: string;
  userId?: string;
  channel: NotificationChannel;
  trigger: NotificationTrigger;
  priority: NotificationPriority;
  message: string;
  createdAt: Date;
  sent: boolean;
  read: boolean;
}

export interface InventoryState {
  items: Item[];
  users: User[];
  checkouts: Checkout[];
  history: HistoryEntry[];
  notifications: InventoryNotification[];
  /** Per-category default loan days (e.g. { Electronics: 7, "Sports Equipment": 3 }). */
  categoryLoanDays: Record<string, number>;
}

export interface CheckoutRequest {
  itemId: string;
  quantity: number;
  /** Override loan duration in days for this specific request. */
  daysOverride?: number;
  /** Basis used to resolve dueDate. */
  dueBasis?: DueBasis;
}
