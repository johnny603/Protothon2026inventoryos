import { AlertCircle, Bell, CheckCircle, Clock, Package, ShieldAlert, TrendingDown, Users } from 'lucide-react';
import { Checkout, InventoryNotification, Item, User } from './types';
import { StatusBadge } from './StatusBadge';
import { formatDueLabel, getDaysOverdue } from '../useInventoryStore';

interface DashboardProps {
  items: Item[];
  users: User[];
  checkouts: Checkout[];
  notifications: InventoryNotification[];
  clock: Date;
}

export function Dashboard({ items, users, checkouts, notifications, clock }: DashboardProps) {
  const activeCheckouts = checkouts.filter(checkout => checkout.status !== 'returned');
  const overdueCheckouts = activeCheckouts
    .filter(checkout => checkout.status === 'overdue')
    .sort((a, b) => getDaysOverdue(b.dueDate, clock) - getDaysOverdue(a.dueDate, clock));

  const stats = {
    totalUnits: items.reduce((sum, item) => sum + item.totalQuantity, 0),
    availableUnits: items.reduce((sum, item) => sum + item.availableQuantity, 0),
    checkedOutUnits: items.reduce((sum, item) => sum + item.checkedOutQuantity, 0),
    overdueUnits: overdueCheckouts.reduce((sum, checkout) => sum + checkout.quantity, 0),
    damagedUnits: items.reduce((sum, item) => sum + item.damagedQuantity, 0),
  };

  const damagedItems = items.filter(item => item.damagedQuantity > 0 || item.damageLevel !== 'none');
  const unreadNotifications = notifications.filter(notification => !notification.read);
  const availabilityRate = Math.round((stats.availableUnits / Math.max(stats.totalUnits, 1)) * 100);

  const statCards = [
    {
      label: 'Checked Out',
      value: stats.checkedOutUnits,
      helper: `${activeCheckouts.length} active loans`,
      icon: Clock,
      tone: 'bg-blue-50 border-blue-200 text-blue-900',
      iconTone: 'bg-blue-600 text-white',
    },
    {
      label: 'Overdue',
      value: stats.overdueUnits,
      helper: 'Priority sorted below',
      icon: AlertCircle,
      tone: 'bg-red-50 border-red-200 text-red-900',
      iconTone: 'bg-red-600 text-white',
    },
    {
      label: 'Damaged',
      value: stats.damagedUnits,
      helper: `${damagedItems.length} item records`,
      icon: ShieldAlert,
      tone: 'bg-orange-50 border-orange-200 text-orange-900',
      iconTone: 'bg-orange-600 text-white',
    },
    {
      label: 'Available',
      value: stats.availableUnits,
      helper: `${availabilityRate}% of inventory`,
      icon: CheckCircle,
      tone: 'bg-green-50 border-green-200 text-green-900',
      iconTone: 'bg-green-600 text-white',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.tone} p-5 rounded-xl border shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.iconTone} w-11 h-11 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-bold">{card.value}</span>
              </div>
              <div className="text-sm font-semibold">{card.label}</div>
              <div className="mt-1 text-xs opacity-80">{card.helper}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Most Urgent Overdue</h3>
              <p className="text-sm text-gray-600">Sorted by severity so admins know who to chase first.</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-semibold">
              {overdueCheckouts.length} active
            </span>
          </div>

          <div className="space-y-3">
            {overdueCheckouts.length > 0 ? overdueCheckouts.slice(0, 6).map(checkout => {
              const item = items.find(candidate => candidate.id === checkout.itemId);
              const user = users.find(candidate => candidate.id === checkout.userId);
              const days = getDaysOverdue(checkout.dueDate, clock);
              return item ? (
                <div key={checkout.id} className="flex items-center gap-4 p-4 rounded-xl border border-red-100 bg-red-50/60">
                  <img src={item.photoUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                      <StatusBadge status="overdue" size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {user?.name || 'Unknown user'} • {checkout.quantity} unit{checkout.quantity === 1 ? '' : 's'} • due {checkout.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-right px-3 py-2 rounded-lg ${days >= 5 ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-lg font-bold">{days}</div>
                    <div className="text-xs font-medium">days overdue</div>
                  </div>
                </div>
              ) : null;
            }) : (
              <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <p className="font-semibold text-green-900">No overdue equipment right now</p>
                <p className="text-sm text-green-700">Inventory is current.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Notification Queue</h3>
            </div>
            <div className="space-y-3">
              {unreadNotifications.slice(0, 4).map(notification => {
                const item = items.find(candidate => candidate.id === notification.itemId);
                return (
                  <div key={notification.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase tracking-wide font-bold text-gray-500">{notification.channel}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        notification.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{item?.name || 'Inventory item'}</p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  </div>
                );
              })}
              {unreadNotifications.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-xl">No unread notifications</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-lg">Stockout Watch</h3>
            </div>
            <div className="space-y-3">
              {items
                .filter(item => item.restockFlag || item.availableQuantity <= Math.max(2, item.totalQuantity * 0.2))
                .slice(0, 4)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.availableQuantity}/{item.totalQuantity} available</p>
                    </div>
                    <Package className="w-4 h-4 text-orange-700" />
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-lg">Live Checkout Feed</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {activeCheckouts.slice(0, 6).map(checkout => {
            const item = items.find(candidate => candidate.id === checkout.itemId);
            const user = users.find(candidate => candidate.id === checkout.userId);
            return item ? (
              <div key={checkout.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <img src={item.photoUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-600">{user?.name} • {formatDueLabel(checkout.dueDate, clock)}</p>
                </div>
                <StatusBadge status={checkout.status === 'overdue' ? 'overdue' : 'checked-out'} size="sm" />
              </div>
            ) : null;
          })}
        </div>
      </section>
    </div>
  );
}
