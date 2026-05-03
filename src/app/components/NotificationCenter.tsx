import { Bell, CheckCheck, Mail, MessageSquare, ShieldAlert } from 'lucide-react';
import { InventoryNotification, Item, User } from './types';

interface NotificationCenterProps {
  notifications: InventoryNotification[];
  items: Item[];
  users: User[];
  onRead: (notificationId: string) => void;
}

export function NotificationCenter({ notifications, items, users, onRead }: NotificationCenterProps) {
  const sorted = [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard label="Unread" value={notifications.filter(n => !n.read).length} />
        <SummaryCard label="Email Nudges" value={notifications.filter(n => n.channel === 'email').length} />
        <SummaryCard label="SMS Placeholders" value={notifications.filter(n => n.channel === 'sms').length} />
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <Bell className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-lg">Automated Notification Queue</h3>
            <p className="text-sm text-gray-600">Email/SMS delivery is simulated for the working prototype.</p>
          </div>
        </div>

        <div className="space-y-3">
          {sorted.map(notification => {
            const item = items.find(candidate => candidate.id === notification.itemId);
            const user = notification.userId ? users.find(candidate => candidate.id === notification.userId) : undefined;
            const ChannelIcon = notification.channel === 'email' ? Mail : MessageSquare;

            return (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border flex items-start gap-4 ${
                  notification.read ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-blue-100 shadow-sm'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  notification.priority === 'critical' ? 'bg-red-100 text-red-700' :
                  notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {notification.trigger === 'damaged' || notification.trigger === 'unusable'
                    ? <ShieldAlert className="w-5 h-5" />
                    : <ChannelIcon className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{item?.name || 'Inventory item'}</span>
                    <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{notification.channel}</span>
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-full ${
                      notification.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {notification.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {notification.createdAt.toLocaleString()}
                    {user ? ` • ${user.name}` : ''}
                  </p>
                </div>

                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => onRead(notification.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-semibold text-gray-600 mt-1">{label}</div>
    </div>
  );
}
