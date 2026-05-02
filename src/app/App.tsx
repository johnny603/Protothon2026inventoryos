import { useState } from 'react';
import { Toaster } from 'sonner';
import { LayoutDashboard, ScanLine, Undo2, Search, Users, Menu, X, Plus } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { FastCheckout } from './components/FastCheckout';
import { FastReturn } from './components/FastReturn';
import { ItemLookup } from './components/ItemLookup';
import { UserLookup } from './components/UserLookup';
import { AddItemFlow } from './components/AddItemFlow';
import { FloatingActionButton } from './components/FloatingActionButton';
import { mockItems, mockUsers, mockHistory } from './components/mockData';
import { Item, ItemCondition } from './components/types';

type View = 'dashboard' | 'checkout' | 'return' | 'item-lookup' | 'user-lookup';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [items, setItems] = useState<Item[]>(mockItems);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const handleCheckout = (itemIds: string[], userId: string) => {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    setItems(items.map(item =>
      itemIds.includes(item.id)
        ? {
            ...item,
            status: 'checked-out' as const,
            currentHolder: userId,
            checkoutDate: now,
            dueDate: dueDate
          }
        : item
    ));
  };

  const handleReturn = (itemId: string, condition: ItemCondition, notes?: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? {
            ...item,
            status: condition === 'damaged' ? 'damaged' as const : 'available' as const,
            condition,
            currentHolder: undefined,
            checkoutDate: undefined,
            dueDate: undefined
          }
        : item
    ));
  };

  const handleAddItem = (itemData: { name: string; category: string; condition: ItemCondition }) => {
    const newItem: Item = {
      id: `i${items.length + 1}`,
      barcode: `EQ${String(Date.now()).slice(-6)}`,
      name: itemData.name,
      category: itemData.category,
      status: 'available',
      condition: itemData.condition,
    };
    setItems([...items, newItem]);
  };

  const handleQuickScan = () => {
    if (currentView !== 'checkout') {
      setCurrentView('checkout');
    }
  };

  const navigation = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkout' as const, label: 'Checkout', icon: ScanLine },
    { id: 'return' as const, label: 'Return', icon: Undo2 },
    { id: 'item-lookup' as const, label: 'Items', icon: Search },
    { id: 'user-lookup' as const, label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      {showAddItem && <AddItemFlow onClose={() => setShowAddItem(false)} onAdd={handleAddItem} />}
      <FloatingActionButton onClick={handleQuickScan} />

      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <ScanLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Equipment Manager</h1>
                <p className="text-xs text-gray-600">Fast & efficient tracking</p>
              </div>
            </div>

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
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium ${
                      currentView === item.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all font-medium shadow-sm ml-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {navigation.find(n => n.id === currentView)?.label}
          </h2>
          <p className="text-gray-600 mt-1">
            {currentView === 'dashboard' && 'Overview of your equipment inventory'}
            {currentView === 'checkout' && 'Scan items to check out to users'}
            {currentView === 'return' && 'Process item returns and log condition'}
            {currentView === 'item-lookup' && 'Search and view item details'}
            {currentView === 'user-lookup' && 'View user checkout history'}
          </p>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard items={items} users={mockUsers} />
        )}

        {currentView === 'checkout' && (
          <FastCheckout items={items} users={mockUsers} onCheckout={handleCheckout} />
        )}

        {currentView === 'return' && (
          <FastReturn items={items} onReturn={handleReturn} />
        )}

        {currentView === 'item-lookup' && (
          <ItemLookup items={items} users={mockUsers} history={mockHistory} />
        )}

        {currentView === 'user-lookup' && (
          <UserLookup items={items} users={mockUsers} />
        )}
      </main>
    </div>
  );
}