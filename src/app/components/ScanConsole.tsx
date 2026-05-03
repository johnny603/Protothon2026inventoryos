import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, ClipboardCheck, PackageCheck, QrCode, ScanLine, ShieldAlert, Trash2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { BarcodeScanner } from './BarcodeScanner';
import { CheckoutRequest, DamageLevel, DueBasis, Item, ItemCondition, User } from './types';
import { StatusBadge } from './StatusBadge';
import { DEFAULT_LOAN_DAYS } from '../useInventoryStore';

interface ScanConsoleProps {
  items: Item[];
  users: User[];
  onScan: (barcode: string) => Item | null;
  onCheckout: (requests: CheckoutRequest[], userId: string) => void;
  onReturn: (itemId: string, quantity: number, condition: ItemCondition, notes?: string) => void;
  onDamage: (itemId: string, damageLevel: DamageLevel, quantity: number, notes?: string) => void;
  /** Per-category default loan days (from store). */
  categoryLoanDays?: Record<string, number>;
}

interface QueueEntry {
  item: Item;
  quantity: number;
}

/** Basis options presented to the operator at checkout time. */
const DUE_BASIS_OPTIONS: { value: DueBasis; label: string }[] = [
  { value: 'per-category', label: 'Category default' },
  { value: 'per-item', label: 'Item default' },
  { value: 'custom', label: 'Custom days' },
];

export function ScanConsole({ items, users, onScan, onCheckout, onReturn, onDamage, categoryLoanDays = {} }: ScanConsoleProps) {
  const [mode, setMode] = useState<'checkout' | 'return' | 'damage'>('checkout');
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [damageLevel, setDamageLevel] = useState<DamageLevel>('minor');
  const [notes, setNotes] = useState('');

  // Due-date configuration state (checkout mode)
  const [dueBasis, setDueBasis] = useState<DueBasis>('per-category');
  const [customDays, setCustomDays] = useState(3);

  // QR-scan user lookup state
  const [userQrInput, setUserQrInput] = useState('');

  const selectedUser = users.find(user => user.id === selectedUserId);

  /** Estimated due date label shown in the Checkout Recipient panel. */
  const estimatedDueDate = useMemo(() => {
    let days = DEFAULT_LOAN_DAYS;
    if (dueBasis === 'custom') {
      days = customDays;
    } else if (dueBasis === 'per-category' && queue.length > 0) {
      const first = queue[0].item;
      days = categoryLoanDays[first.category] ?? DEFAULT_LOAN_DAYS;
    } else if (dueBasis === 'per-item' && queue.length > 0) {
      days = queue[0].item.defaultLoanDays ?? categoryLoanDays[queue[0].item.category] ?? DEFAULT_LOAN_DAYS;
    }
    const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }, [queue, dueBasis, customDays, categoryLoanDays]);

  const handleScan = (barcode: string) => {
    const item = onScan(barcode);
    if (!item) {
      toast.error(`No item found for ${barcode}`);
      return;
    }

    if (mode === 'checkout' && item.availableQuantity < 1) {
      toast.error(`${item.name} has no available units`);
      return;
    }

    if ((mode === 'return' || mode === 'damage') && item.checkedOutQuantity < 1 && mode === 'return') {
      toast.warning(`${item.name} is not currently checked out`);
      return;
    }

    setQueue(current => {
      const existing = current.find(entry => entry.item.id === item.id);
      if (existing) {
        if (mode === 'checkout' && existing.quantity >= item.availableQuantity) {
          toast.warning('All available units are already queued');
          return current;
        }
        return current.map(entry => (
          entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        ));
      }
      return [{ item, quantity: 1 }, ...current];
    });

    toast.success(`${item.name} added to ${mode} queue`);
  };

  /** QR code scan: look up user by scanned ID and auto-select them. */
  const handleUserQrScan = (e: React.FormEvent) => {
    e.preventDefault();
    const id = userQrInput.trim();
    if (!id) return;
    const found = users.find(u => u.id === id);
    if (found) {
      if (!found.active || found.restricted || !found.permissions.includes('checkout')) {
        toast.error(`${found.name} cannot check out items`);
      } else {
        setSelectedUserId(found.id);
        toast.success(`User selected via QR: ${found.name}`);
      }
    } else {
      toast.error(`No user found for QR ID: ${id}`);
    }
    setUserQrInput('');
  };

  const setQuantity = (itemId: string, quantity: number) => {
    setQueue(current => current.map(entry => {
      if (entry.item.id !== itemId) return entry;
      const max = mode === 'checkout'
        ? entry.item.availableQuantity
        : Math.max(entry.item.checkedOutQuantity, entry.item.availableQuantity, 1);
      return { ...entry, quantity: Math.max(1, Math.min(quantity, max)) };
    }));
  };

  const removeItem = (itemId: string) => {
    setQueue(current => current.filter(entry => entry.item.id !== itemId));
  };

  const handleConfirm = () => {
    if (queue.length === 0) {
      toast.error('Scan at least one item first');
      return;
    }

    if (mode === 'checkout') {
      if (!selectedUserId) {
        toast.error('Select a user before checkout');
        return;
      }
      // Pass per-request due overrides so the store can apply the correct duration.
      const requests: CheckoutRequest[] = queue.map(entry => ({
        itemId: entry.item.id,
        quantity: entry.quantity,
        dueBasis,
        daysOverride: dueBasis === 'custom' ? customDays : undefined,
      }));
      onCheckout(requests, selectedUserId);
    }

    if (mode === 'return') {
      queue.forEach(entry => onReturn(entry.item.id, entry.quantity, condition, notes));
    }

    if (mode === 'damage') {
      queue.forEach(entry => onDamage(entry.item.id, damageLevel, entry.quantity, notes));
    }

    setQueue([]);
    setNotes('');
  };

  const modeConfig = {
    checkout: { label: 'Checkout', icon: ClipboardCheck, tone: 'bg-blue-600 text-white', helper: 'Scan items, select user, confirm.' },
    return: { label: 'Return', icon: Undo2, tone: 'bg-green-600 text-white', helper: 'Scan returned items and confirm condition.' },
    damage: { label: 'Damage', icon: ShieldAlert, tone: 'bg-orange-600 text-white', helper: 'Scan item, tag damage, notify admins.' },
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <section className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Scan Console</h3>
              <p className="text-sm text-gray-600">Primary workflow: scan, auto-detect, confirm.</p>
            </div>
            <div className="flex gap-2">
              {(Object.keys(modeConfig) as Array<keyof typeof modeConfig>).map(key => {
                const Icon = modeConfig[key].icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setMode(key);
                      setQueue([]);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                      mode === key ? modeConfig[key].tone : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {modeConfig[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-5">
            <BarcodeScanner onScan={handleScan} placeholder="Scan item barcode or QR code..." />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ScanLine className="w-4 h-4 text-blue-600" />
            <span>{modeConfig[mode].helper} Scanner input refocuses after every entry.</span>
          </div>
        </div>

        {mode === 'checkout' && (
          <>
            {/* Due-date configuration */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-3">Due Timer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose how the return deadline is calculated for this checkout batch.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {DUE_BASIS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDueBasis(opt.value)}
                    className={`px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
                      dueBasis === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {dueBasis === 'custom' && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Loan days:</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={e => setCustomDays(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-sm text-gray-500">
                    Due: {new Date(Date.now() + customDays * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}

              {dueBasis === 'per-category' && queue.length > 0 && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {queue.map(entry => {
                    const days = categoryLoanDays[entry.item.category] ?? DEFAULT_LOAN_DAYS;
                    return (
                      <div key={entry.item.id} className="flex justify-between">
                        <span className="truncate">{entry.item.name}</span>
                        <span className="ml-4 shrink-0 font-medium">{days}d ({entry.item.category})</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {dueBasis === 'per-item' && queue.length > 0 && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {queue.map(entry => {
                    const days = entry.item.defaultLoanDays ?? categoryLoanDays[entry.item.category] ?? DEFAULT_LOAN_DAYS;
                    return (
                      <div key={entry.item.id} className="flex justify-between">
                        <span className="truncate">{entry.item.name}</span>
                        <span className="ml-4 shrink-0 font-medium">{days}d{entry.item.defaultLoanDays ? ' (item override)' : ' (category fallback)'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Checkout Recipient */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Checkout Recipient</h3>
                <span className="text-sm font-semibold px-3 py-1 rounded-lg bg-blue-50 text-blue-700">
                  Est. return: {estimatedDueDate}
                </span>
              </div>

              {/* QR user scan */}
              <form onSubmit={handleUserQrScan} className="flex gap-2 mb-4">
                <div className="flex items-center gap-2 flex-1 px-4 py-2 border border-gray-300 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <QrCode className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={userQrInput}
                    onChange={e => setUserQrInput(e.target.value)}
                    placeholder="Scan user QR code ID..."
                    className="flex-1 outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Select
                </button>
              </form>

              <div className="grid md:grid-cols-2 gap-3">
                {users.map(user => {
                  const disabled = !user.active || user.restricted || !user.permissions.includes('checkout');
                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedUserId === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.roles.join(' + ')}</p>
                          <p className="text-xs text-gray-500 mt-1">{user.groups.join(', ')}</p>
                        </div>
                        {disabled && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedUser && (
                <p className="text-sm text-blue-700 mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  {selectedUser.name} can check out {queue.reduce((sum, entry) => sum + entry.quantity, 0)} unit{queue.reduce((sum, entry) => sum + entry.quantity, 0) === 1 ? '' : 's'} due on {estimatedDueDate}.
                </p>
              )}
            </div>
          </>
        )}

        {(mode === 'return' || mode === 'damage') && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            {mode === 'return' ? (
              <div>
                <h3 className="font-semibold text-lg mb-3">Return Condition</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {(['excellent', 'good', 'fair', 'poor', 'damaged'] as ItemCondition[]).map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCondition(value)}
                      className={`px-3 py-3 rounded-xl border-2 capitalize font-semibold ${
                        condition === value ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-lg mb-3">Damage Tag</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['minor', 'major', 'unusable'] as DamageLevel[]).map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDamageLevel(value)}
                      className={`px-3 py-3 rounded-xl border-2 capitalize font-semibold ${
                        damageLevel === value ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes for history and admin review..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>
        )}
      </section>

      <aside className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-fit sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Bulk Queue</h3>
            <p className="text-sm text-gray-600">{queue.length} item record{queue.length === 1 ? '' : 's'} ready</p>
          </div>
          {queue.length > 0 && (
            <button onClick={() => setQueue([])} className="text-sm font-semibold text-blue-600">Clear</button>
          )}
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {queue.length > 0 ? queue.map(entry => (
            <div key={entry.item.id} className="p-3 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <img src={entry.item.photoUrl} alt={entry.item.name} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{entry.item.name}</p>
                  <p className="text-xs text-gray-600 font-mono">{entry.item.barcode}</p>
                  <div className="mt-2">
                    <StatusBadge status={entry.item.status} size="sm" />
                  </div>
                </div>
                <button onClick={() => removeItem(entry.item.id)} className="p-1.5 h-fit rounded-lg hover:bg-white">
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-semibold text-gray-500">Qty</span>
                <input
                  type="number"
                  min={1}
                  value={entry.quantity}
                  onChange={(event) => setQuantity(entry.item.id, Number(event.target.value))}
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300"
                />
                <span className="text-xs text-gray-500">
                  {mode === 'checkout' ? `${entry.item.availableQuantity} available` : `${entry.item.checkedOutQuantity} out`}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 rounded-xl bg-gray-50 border border-dashed border-gray-300">
              <PackageCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Scan items to start</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={queue.length === 0 || (mode === 'checkout' && !selectedUserId)}
          className="mt-5 w-full py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Confirm {modeConfig[mode].label}
        </button>
      </aside>
    </div>
  );
}
