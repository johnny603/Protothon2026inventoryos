import { useState } from 'react';
import { X, Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ItemCondition } from './types';

interface AddItemFlowProps {
  onClose: () => void;
  onAdd: (item: { name: string; category: string; condition: ItemCondition }) => void;
}

export function AddItemFlow({ onClose, onAdd }: AddItemFlowProps) {
  const [step, setStep] = useState<'form' | 'barcode'>('form');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: 'excellent' as ItemCondition,
  });
  const [generatedBarcode, setGeneratedBarcode] = useState('');

  const categories = [
    'Electronics',
    'Sports Equipment',
    'Fitness',
    'Weights',
    'Audio',
    'Photography',
    'Office',
    'Training',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const barcode = `EQ${String(Date.now()).slice(-6)}`;
    setGeneratedBarcode(barcode);
    setStep('barcode');
  };

  const handleFinish = () => {
    onAdd(formData);
    toast.success(`${formData.name} added successfully`);
    onClose();
  };

  const handleDownloadBarcode = () => {
    toast.success('Barcode downloaded - ready to print');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold">Add New Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 mb-6">
                <div className="flex-1 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., MacBook Pro 14&quot; M3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Initial Condition</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['excellent', 'good', 'fair'] as ItemCondition[]).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: c })}
                      className={`px-4 py-3 rounded-xl border-2 transition-all capitalize ${
                        formData.condition === c
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
              >
                Continue to Barcode
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2 mb-6">
                <div className="flex-1 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1 h-2 bg-blue-600 rounded-full"></div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Item Created Successfully!</h3>
                <p className="text-gray-600 mb-6">Your barcode has been generated</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <div className="bg-white p-6 rounded-lg inline-block mb-4 shadow-sm">
                  <div className="space-y-1 mb-4">
                    <div className="flex gap-1 justify-center">
                      {generatedBarcode.split('').map((char, i) => (
                        <div key={i} className="w-2 h-16 bg-black" style={{ opacity: (i % 2) ? 0.3 : 1 }}></div>
                      ))}
                    </div>
                    <div className="text-xl font-mono font-semibold tracking-wider">{generatedBarcode}</div>
                  </div>
                  <div className="text-sm text-gray-600">{formData.name}</div>
                </div>

                <button
                  onClick={handleDownloadBarcode}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download & Print Barcode
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>Next Steps:</strong> Print this barcode and attach it to your item.
                  You can now scan it for checkout/return operations.
                </p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
              >
                Finish & Add Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
