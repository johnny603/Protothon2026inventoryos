import { Item, User } from './types';
import { StatusBadge } from './StatusBadge';
import { AlertCircle, Package, Clock, CheckCircle, TrendingDown } from 'lucide-react';

interface DashboardProps {
  items: Item[];
  users: User[];
}

export function Dashboard({ items, users }: DashboardProps) {
  const stats = {
    total: items.length,
    available: items.filter(i => i.status === 'available').length,
    checkedOut: items.filter(i => i.status === 'checked-out').length,
    overdue: items.filter(i => i.status === 'overdue').length,
    damaged: items.filter(i => i.status === 'damaged').length,
  };

  const overdueItems = items.filter(i => i.status === 'overdue');
  const recentCheckouts = items.filter(i => i.status === 'checked-out' || i.status === 'overdue').slice(0, 5);
  const availabilityRate = Math.round((stats.available / stats.total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">Total Items</div>
          <div className="mt-2 text-xs text-gray-500">{availabilityRate}% available</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-green-900">{stats.available}</span>
          </div>
          <div className="text-sm font-medium text-green-900">Available</div>
          <div className="mt-2 text-xs text-green-700">Ready to use</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-yellow-900">{stats.checkedOut}</span>
          </div>
          <div className="text-sm font-medium text-yellow-900">Checked Out</div>
          <div className="mt-2 text-xs text-yellow-700">In use now</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-red-900">{stats.overdue}</span>
          </div>
          <div className="text-sm font-medium text-red-900">Overdue</div>
          <div className="mt-2 text-xs text-red-700">Needs attention</div>
        </div>
      </div>

      {overdueItems.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Overdue Items Require Attention</h3>
              <p className="text-sm text-red-700">{overdueItems.length} {overdueItems.length === 1 ? 'item' : 'items'} past due date</p>
            </div>
          </div>
          <div className="space-y-3">
            {overdueItems.map(item => {
              const holder = users.find(u => u.id === item.currentHolder);
              const daysOverdue = item.dueDate ? Math.floor((Date.now() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <div key={item.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {holder?.name} • <span className="font-medium text-red-600">{daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue</span>
                    </div>
                  </div>
                  <StatusBadge status="overdue" size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentCheckouts.map(item => {
            const holder = users.find(u => u.id === item.currentHolder);
            return (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{holder?.name}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    {item.checkoutDate?.toLocaleDateString()}
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
