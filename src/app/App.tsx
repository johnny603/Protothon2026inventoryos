import { useState } from 'react';
import { Toaster } from 'sonner';
import { Bell, LayoutDashboard, Menu, Plus, RotateCcw, ScanLine, Search, Users, X } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ItemLookup } from './components/ItemLookup';
import { UserLookup } from './components/UserLookup';
import { AddItemFlow } from './components/AddItemFlow';
import { FloatingActionButton } from './components/FloatingActionButton';
import { ScanConsole } from './components/ScanConsole';
import { NotificationCenter } from './components/NotificationCenter';
import { useInventoryStore } from './useInventoryStore';

type View = 'dashboard' | 'scan' | 'item-lookup' | 'user-lookup' | 'notifications';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const inventory = useInventoryStore();
  const unreadNotifications = inventory.notifications.filter(notification => !notification.read).length;

  const navigation = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan' as const, label: 'Scan Console', icon: ScanLine },
    { id: 'item-lookup' as const, label: 'Items', icon: Search },
    { id: 'user-lookup' as const, label: 'Users', icon: Users },
    { id: 'notifications' as const, label: 'Alerts', icon: Bell, badge: unreadNotifications },
  ];

  const viewCopy = {
    dashboard: 'Live system health and urgent inventory activity',
    scan: 'Barcode-first checkout, return, and damage logging',
    'item-lookup': 'Photo-backed records, quantity tools, and traceable history',
    'user-lookup': 'Current ownership, risk controls, and user status',
    notifications: 'Automated email/SMS placeholder nudges and admin alerts',
  };

  const goToScan = () => setCurrentView('scan');

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      {showAddItem && <AddItemFlow onClose={() => setShowAddItem(false)} onAdd={inventory.addItem} />}
      <FloatingActionButton onClick={goToScan} />

      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button type="button" onClick={() => setCurrentView('dashboard')} className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-slate-900 rounded-xl flex items-center justify-center shadow-md">
                <ScanLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-950">InventoryOS</h1>
                <p className="text-xs text-gray-600">Real-time equipment operations</p>
              </div>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden md:flex items-center gap-2">
              {navigation.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                      currentView === item.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 ${currentView === item.id ? 'bg-white text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all font-medium shadow-sm ml-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
              <button
                onClick={inventory.resetDemo}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium"
                title="Reset demo data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </nav>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                {navigation.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        currentView === item.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge ? <span className="ml-auto text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">{item.badge}</span> : null}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setShowAddItem(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm mt-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add New Item</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {navigation.find(n => n.id === currentView)?.label}
            </h2>
            <p className="text-gray-600 mt-1">{viewCopy[currentView]}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700">
              {inventory.items.reduce((sum, item) => sum + item.availableQuantity, 0)} available
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700">
              {inventory.checkouts.filter(checkout => checkout.status === 'overdue').length} overdue loans
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700">
              {inventory.riskFlags.items.length} risk flags
            </span>
          </div>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard
            items={inventory.items}
            users={inventory.users}
            checkouts={inventory.checkouts}
            notifications={inventory.notifications}
            clock={inventory.clock}
          />
        )}

        {currentView === 'scan' && (
          <ScanConsole
            items={inventory.items}
            users={inventory.users}
            onScan={inventory.scanBarcode}
            onCheckout={inventory.checkoutItems}
            onReturn={inventory.returnItems}
            onDamage={inventory.markDamage}
          />
        )}

        {currentView === 'item-lookup' && (
          <ItemLookup
            items={inventory.items}
            users={inventory.users}
            history={inventory.history}
            onSplit={inventory.splitItemQuantity}
            onMerge={inventory.mergeItemQuantity}
          />
        )}

        {currentView === 'user-lookup' && (
          <UserLookup
            items={inventory.items}
            users={inventory.users}
            checkouts={inventory.checkouts}
            clock={inventory.clock}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationCenter
            notifications={inventory.notifications}
            items={inventory.items}
            users={inventory.users}
            onRead={inventory.markNotificationRead}
          />
        )}
      </main>
    </div>
  );
}
