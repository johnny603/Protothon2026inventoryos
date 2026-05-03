import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { initialInventoryState } from './components/mockData';
import {
  Checkout,
  CheckoutRequest,
  DamageLevel,
  HistoryEntry,
  InventoryNotification,
  InventoryState,
  Item,
  ItemCondition,
  NotificationPriority,
  NotificationTrigger,
  User,
} from './components/types';

const STORAGE_KEY = 'inventoryos-state-v2';
const DEFAULT_LOAN_DAYS = 3;
const APPROACHING_DUE_HOURS = 24;

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const reviveDates = (state: InventoryState): InventoryState => ({
  ...state,
  items: state.items.map(item => ({
    ...item,
    createdAt: new Date(item.createdAt),
    checkoutDate: item.checkoutDate ? new Date(item.checkoutDate) : undefined,
    dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
  })),
  checkouts: state.checkouts.map(checkout => ({
    ...checkout,
    checkoutDate: new Date(checkout.checkoutDate),
    dueDate: new Date(checkout.dueDate),
    returnedDate: checkout.returnedDate ? new Date(checkout.returnedDate) : undefined,
  })),
  history: state.history.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp),
  })),
  notifications: state.notifications.map(notification => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
  })),
});

const loadState = (): InventoryState => {
  if (typeof window === 'undefined') return initialInventoryState;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? reviveDates(JSON.parse(stored)) : initialInventoryState;
  } catch {
    return initialInventoryState;
  }
};

const saveState = (state: InventoryState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getDaysOverdue = (dueDate?: Date, now = new Date()) => {
  if (!dueDate || dueDate.getTime() > now.getTime()) return 0;
  return Math.max(1, Math.ceil((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)));
};

export const formatDueLabel = (dueDate?: Date, now = new Date()) => {
  if (!dueDate) return 'No due date';
  const diffMs = dueDate.getTime() - now.getTime();
  if (diffMs < 0) {
    const days = getDaysOverdue(dueDate, now);
    return `${days} ${days === 1 ? 'day' : 'days'} overdue`;
  }

  const hours = Math.ceil(diffMs / (60 * 60 * 1000));
  if (hours < 24) return `Due in ${hours}h`;
  const days = Math.ceil(hours / 24);
  return `Due in ${days}d`;
};

export const getSeverity = (dueDate?: Date): NotificationPriority => {
  const days = getDaysOverdue(dueDate);
  if (days >= 5) return 'critical';
  if (days >= 2) return 'high';
  if (days >= 1) return 'medium';
  return 'low';
};

const getItemStatus = (item: Item, activeCheckouts: Checkout[]): Item['status'] => {
  if (item.lostQuantity >= item.totalQuantity) return 'lost';
  if (item.damageLevel === 'unusable' || item.damagedQuantity >= item.totalQuantity) return 'damaged';
  if (activeCheckouts.some(checkout => checkout.itemId === item.id && checkout.status === 'overdue')) return 'overdue';
  if (item.checkedOutQuantity > 0) return 'checked-out';
  if (item.damagedQuantity > 0 && item.availableQuantity === 0) return 'damaged';
  return 'available';
};

const createHistory = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): HistoryEntry => ({
  ...entry,
  id: makeId('h'),
  timestamp: new Date(),
});

const createNotification = (
  item: Item,
  trigger: NotificationTrigger,
  message: string,
  userId?: string,
  priority: NotificationPriority = 'medium',
): InventoryNotification => ({
  id: makeId('n'),
  itemId: item.id,
  userId,
  channel: trigger === 'approaching-due' ? 'email' : 'sms',
  trigger,
  priority,
  message,
  createdAt: new Date(),
  sent: true,
  read: false,
});

export function evaluateOverdueItems(state: InventoryState, now = new Date()): InventoryState {
  let changed = false;
  const notifications = [...state.notifications];

  const checkouts = state.checkouts.map(checkout => {
    if (checkout.status === 'returned') return checkout;
    const nextStatus = checkout.dueDate.getTime() < now.getTime() ? 'overdue' : 'active';
    if (nextStatus === checkout.status) return checkout;
    changed = true;

    if (nextStatus === 'overdue') {
      const item = state.items.find(candidate => candidate.id === checkout.itemId);
      const user = state.users.find(candidate => candidate.id === checkout.userId);
      const alreadyNotified = notifications.some(
        notification => notification.itemId === checkout.itemId && notification.trigger === 'overdue' && !notification.read,
      );
      if (item && !alreadyNotified) {
        notifications.push(createNotification(
          item,
          'overdue',
          `${item.name} is now overdue${user ? ` with ${user.name}` : ''}.`,
          checkout.userId,
          getSeverity(checkout.dueDate),
        ));
      }
    }

    return { ...checkout, status: nextStatus };
  });

  state.checkouts.forEach(checkout => {
    if (checkout.status === 'returned') return;
    const msUntilDue = checkout.dueDate.getTime() - now.getTime();
    if (msUntilDue <= 0 || msUntilDue > APPROACHING_DUE_HOURS * 60 * 60 * 1000) return;
    const exists = notifications.some(notification => notification.itemId === checkout.itemId && notification.trigger === 'approaching-due');
    const item = state.items.find(candidate => candidate.id === checkout.itemId);
    if (!exists && item) {
      changed = true;
      notifications.push(createNotification(
        item,
        'approaching-due',
        `${item.name} is due soon. Reminder sent before it becomes overdue.`,
        checkout.userId,
        'medium',
      ));
    }
  });

  if (!changed) return state;

  const items = state.items.map(item => ({
    ...item,
    status: getItemStatus(item, checkouts.filter(checkout => checkout.status !== 'returned')),
  }));

  return { ...state, items, checkouts, notifications };
}

export function useInventoryStore() {
  const [state, setState] = useState<InventoryState>(() => evaluateOverdueItems(loadState()));
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
      setState(current => evaluateOverdueItems(current));
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const setAndEvaluate = useCallback((updater: (current: InventoryState) => InventoryState) => {
    setState(current => evaluateOverdueItems(updater(current)));
  }, []);

  const scanBarcode = useCallback((barcode: string) => {
    const item = state.items.find(candidate => candidate.barcode.toLowerCase() === barcode.toLowerCase());
    if (!item) return null;

    setState(current => ({
      ...current,
      history: [
        createHistory({ itemId: item.id, action: 'scan', notes: `Scanned ${barcode}` }),
        ...current.history,
      ],
    }));

    return item;
  }, [state.items]);

  const checkoutItems = useCallback((requests: CheckoutRequest[], userId: string) => {
    setAndEvaluate(current => {
      const user = current.users.find(candidate => candidate.id === userId);
      if (!user || !user.active || user.restricted || !user.permissions.includes('checkout')) {
        toast.error('This user cannot check out equipment');
        return current;
      }

      const now = new Date();
      const dueDate = new Date(now.getTime() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);
      const nextItems = current.items.map(item => {
        const request = requests.find(candidate => candidate.itemId === item.id);
        if (!request) return item;
        if (request.quantity < 1 || request.quantity > item.availableQuantity) return item;

        return {
          ...item,
          availableQuantity: item.availableQuantity - request.quantity,
          checkedOutQuantity: item.checkedOutQuantity + request.quantity,
          currentHolder: userId,
          checkoutDate: now,
          dueDate,
          lastSeenWith: userId,
        };
      });

      const invalid = requests.find(request => {
        const item = current.items.find(candidate => candidate.id === request.itemId);
        return !item || request.quantity < 1 || request.quantity > item.availableQuantity;
      });

      if (invalid) {
        toast.error('One or more items are unavailable for that quantity');
        return current;
      }

      const checkouts: Checkout[] = requests.map(request => ({
        id: makeId('c'),
        itemId: request.itemId,
        userId,
        quantity: request.quantity,
        checkoutDate: now,
        dueDate,
        status: 'active',
      }));

      const history = requests.map(request => createHistory({
        itemId: request.itemId,
        userId,
        action: 'checkout',
        quantity: request.quantity,
        notes: `Due ${dueDate.toLocaleDateString()}`,
      }));

      toast.success(`${requests.length} item ${requests.length === 1 ? 'record' : 'records'} checked out. Due ${dueDate.toLocaleDateString()}.`);

      return {
        ...current,
        items: nextItems.map(item => ({ ...item, status: getItemStatus(item, [...current.checkouts, ...checkouts]) })),
        checkouts: [...checkouts, ...current.checkouts],
        history: [...history, ...current.history],
      };
    });
  }, [setAndEvaluate]);

  const returnItems = useCallback((itemId: string, quantity: number, condition: ItemCondition, notes?: string) => {
    setAndEvaluate(current => {
      const item = current.items.find(candidate => candidate.id === itemId);
      if (!item || quantity < 1 || quantity > item.checkedOutQuantity) {
        toast.error('Return quantity is not valid');
        return current;
      }

      let remaining = quantity;
      const checkouts = current.checkouts.map(checkout => {
        if (checkout.itemId !== itemId || checkout.status === 'returned' || remaining <= 0) return checkout;
        const returnedQuantity = Math.min(remaining, checkout.quantity);
        remaining -= returnedQuantity;
        return {
          ...checkout,
          quantity: checkout.quantity - returnedQuantity,
          returnedDate: checkout.quantity === returnedQuantity ? new Date() : checkout.returnedDate,
          status: checkout.quantity === returnedQuantity ? 'returned' as const : checkout.status,
        };
      });

      const damagedQuantity = condition === 'damaged' || condition === 'poor' ? quantity : 0;
      const availableReturnQuantity = quantity - damagedQuantity;
      const nextItems = current.items.map(candidate => {
        if (candidate.id !== itemId) return candidate;
        const nextItem = {
          ...candidate,
          condition,
          checkedOutQuantity: candidate.checkedOutQuantity - quantity,
          availableQuantity: candidate.availableQuantity + availableReturnQuantity,
          damagedQuantity: candidate.damagedQuantity + damagedQuantity,
          damageLevel: damagedQuantity > 0 ? 'minor' as const : candidate.damageLevel,
          currentHolder: candidate.checkedOutQuantity - quantity > 0 ? candidate.currentHolder : undefined,
          checkoutDate: candidate.checkedOutQuantity - quantity > 0 ? candidate.checkoutDate : undefined,
          dueDate: candidate.checkedOutQuantity - quantity > 0 ? candidate.dueDate : undefined,
        };
        return { ...nextItem, status: getItemStatus(nextItem, checkouts) };
      });

      toast.success(`${item.name} return recorded`);

      return {
        ...current,
        items: nextItems,
        checkouts,
        history: [
          createHistory({ itemId, action: 'return', quantity, condition, notes }),
          ...current.history,
        ],
      };
    });
  }, [setAndEvaluate]);

  const markDamage = useCallback((itemId: string, damageLevel: DamageLevel, quantity: number, notes?: string) => {
    setAndEvaluate(current => {
      const item = current.items.find(candidate => candidate.id === itemId);
      if (!item || damageLevel === 'none' || quantity < 1) return current;
      const usableLoss = Math.min(quantity, item.availableQuantity);
      const trigger: NotificationTrigger = damageLevel === 'unusable' ? 'unusable' : 'damaged';
      const priority: NotificationPriority = damageLevel === 'unusable' ? 'critical' : damageLevel === 'major' ? 'high' : 'medium';

      const items = current.items.map(candidate => {
        if (candidate.id !== itemId) return candidate;
        const nextItem = {
          ...candidate,
          condition: 'damaged' as const,
          damageLevel,
          availableQuantity: candidate.availableQuantity - usableLoss,
          damagedQuantity: candidate.damagedQuantity + usableLoss,
          restockFlag: candidate.restockFlag || damageLevel === 'unusable' || damageLevel === 'major',
        };
        return { ...nextItem, status: getItemStatus(nextItem, current.checkouts) };
      });

      toast.warning(`${item.name} marked ${damageLevel}`);

      return {
        ...current,
        items,
        history: [
          createHistory({ itemId, action: 'damage-report', damageLevel, quantity, condition: 'damaged', notes }),
          ...current.history,
        ],
        notifications: [
          createNotification(item, trigger, `${item.name} marked ${damageLevel}. Admin review queued.`, item.currentHolder, priority),
          ...current.notifications,
        ],
      };
    });
  }, [setAndEvaluate]);

  const splitItemQuantity = useCallback((itemId: string, quantity: number) => {
    setAndEvaluate(current => {
      const item = current.items.find(candidate => candidate.id === itemId);
      if (!item || item.kind !== 'bulk' || quantity < 1 || quantity >= item.availableQuantity) {
        toast.error('Only available bulk quantities can be split');
        return current;
      }

      const child: Item = {
        ...item,
        id: makeId('i'),
        barcode: `EQ${String(Date.now()).slice(-6)}`,
        name: `${item.name} split pack`,
        totalQuantity: quantity,
        availableQuantity: quantity,
        checkedOutQuantity: 0,
        damagedQuantity: 0,
        lostQuantity: 0,
        currentHolder: undefined,
        checkoutDate: undefined,
        dueDate: undefined,
        parentItemId: item.id,
        createdAt: new Date(),
      };

      const items = current.items.map(candidate => (
        candidate.id === itemId
          ? { ...candidate, totalQuantity: candidate.totalQuantity - quantity, availableQuantity: candidate.availableQuantity - quantity }
          : candidate
      ));

      toast.success(`Split ${quantity} from ${item.name}`);
      return {
        ...current,
        items: [child, ...items],
        history: [
          createHistory({ itemId, action: 'split', quantity, notes: `Created ${child.barcode}` }),
          ...current.history,
        ],
      };
    });
  }, [setAndEvaluate]);

  const mergeItemQuantity = useCallback((sourceItemId: string, targetItemId: string) => {
    setAndEvaluate(current => {
      const source = current.items.find(item => item.id === sourceItemId);
      const target = current.items.find(item => item.id === targetItemId);
      if (!source || !target || source.category !== target.category || source.name.replace(' split pack', '') !== target.name.replace(' split pack', '')) {
        toast.error('Items must be compatible to merge');
        return current;
      }

      const items = current.items
        .filter(item => item.id !== sourceItemId)
        .map(item => item.id === targetItemId
          ? {
              ...item,
              totalQuantity: item.totalQuantity + source.totalQuantity,
              availableQuantity: item.availableQuantity + source.availableQuantity,
              checkedOutQuantity: item.checkedOutQuantity + source.checkedOutQuantity,
              damagedQuantity: item.damagedQuantity + source.damagedQuantity,
              lostQuantity: item.lostQuantity + source.lostQuantity,
            }
          : item);

      toast.success(`Merged ${source.name} into ${target.name}`);
      return {
        ...current,
        items,
        history: [
          createHistory({ itemId: targetItemId, action: 'merge', quantity: source.totalQuantity, notes: `Merged ${source.barcode}` }),
          ...current.history,
        ],
      };
    });
  }, [setAndEvaluate]);

  const addItem = useCallback((itemData: Pick<Item, 'name' | 'category' | 'condition' | 'kind' | 'photoUrl' | 'totalQuantity'>) => {
    setAndEvaluate(current => {
      const item: Item = {
        ...itemData,
        id: makeId('i'),
        barcode: `EQ${String(Date.now()).slice(-6)}`,
        status: 'available',
        availableQuantity: itemData.totalQuantity,
        checkedOutQuantity: 0,
        damagedQuantity: 0,
        lostQuantity: 0,
        damageLevel: 'none',
        restockFlag: false,
        createdAt: new Date(),
      };

      toast.success(`${item.name} added with barcode ${item.barcode}`);
      return {
        ...current,
        items: [item, ...current.items],
        history: [
          createHistory({ itemId: item.id, action: 'scan', notes: `Created item ${item.barcode}` }),
          ...current.history,
        ],
      };
    });
  }, [setAndEvaluate]);

  const markNotificationRead = useCallback((notificationId: string) => {
    setState(current => ({
      ...current,
      notifications: current.notifications.map(notification => (
        notification.id === notificationId ? { ...notification, read: true } : notification
      )),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(evaluateOverdueItems(initialInventoryState));
    toast.success('InventoryOS demo data reset');
  }, []);

  const riskFlags = useMemo(() => {
    const damageCounts = state.history.reduce<Record<string, number>>((acc, entry) => {
      if (entry.action === 'damage-report') acc[entry.itemId] = (acc[entry.itemId] || 0) + 1;
      return acc;
    }, {});

    return {
      users: state.users.filter(user => user.repeatOffender || state.checkouts.filter(checkout => checkout.userId === user.id && checkout.status === 'overdue').length >= 2),
      items: state.items.filter(item => item.restockFlag || item.damageLevel === 'major' || item.damageLevel === 'unusable' || (damageCounts[item.id] || 0) >= 2 || item.availableQuantity <= Math.max(2, item.totalQuantity * 0.2)),
    };
  }, [state]);

  return {
    ...state,
    clock,
    riskFlags,
    scanBarcode,
    checkoutItems,
    returnItems,
    markDamage,
    splitItemQuantity,
    mergeItemQuantity,
    addItem,
    markNotificationRead,
    resetDemo,
  };
}
