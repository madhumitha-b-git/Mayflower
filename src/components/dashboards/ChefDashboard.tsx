import React, { useState } from 'react';
import { ChefHat, ClipboardList, CheckSquare, LogOut, Bell, CheckCircle, Clock, Flame } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props { user: UserProfile; onLogout: () => void; }

export const ChefDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'sop' | 'checklist'>('kitchen');
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) => setChecked(p => ({ ...p, [i]: !p[i] }));

  const orders = [
    { table: 'T3', items: ['Khao Suey x2', 'Sourdough Pizza x1'], status: 'In Progress', time: '12 min' },
    { table: 'T1', items: ['Dim Sum Platter x1', 'Asian Bowl x2'], status: 'Pending', time: '5 min' },
    { table: 'T6', items: ['Pasta Ravioli x1', 'Sizzling Brownie x2'], status: 'Ready', time: '0 min' },
    { table: 'T2', items: ['Burger x2', 'Monster Shake x2'], status: 'In Progress', time: '8 min' },
  ];

  const sops = [
    { title: 'Dim Sum Preparation SOP', steps: ['Steam at 85°C for 12 min', 'Check filling consistency', 'Plate with dipping sauce', 'Serve within 3 min of steaming'] },
    { title: 'Sourdough Pizza SOP', steps: ['Preheat oven to 280°C', 'Stretch dough to 10 inch', 'Add toppings evenly', 'Bake 8-10 min until crust golden'] },
    { title: 'Khao Suey SOP', steps: ['Prepare coconut broth base', 'Cook noodles al dente', 'Arrange condiments in bowls', 'Assemble at table side'] },
  ];

  const checklist = [
    'Check ingredient stock levels', 'Clean prep stations', 'Verify cold storage temperatures',
    'Review today\'s reservation count', 'Prep mise en place for dinner service',
    'Check allergen labels on all dishes', 'Brief kitchen team on specials',
  ];

  const statusColor = (s: string) => ({ 'In Progress': 'text-amber-600 bg-amber-50', Pending: 'text-blue-600 bg-blue-50', Ready: 'text-green-600 bg-green-50' }[s] || '');

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Chef Dashboard</div>
            <div className="text-xs text-gray-400">The Mayflower — Kitchen Operations</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="text-xs text-gray-300">{user.email}</div>
          <button onClick={onLogout} className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 cursor-pointer">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-[#E8E4DB] px-6 flex space-x-1">
        {[{ id: 'kitchen', label: 'Kitchen Orders', icon: Flame }, { id: 'sop', label: 'SOPs', icon: ClipboardList }, { id: 'checklist', label: 'Checklist', icon: CheckSquare }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === id ? 'border-orange-500 text-orange-600' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {activeTab === 'kitchen' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Live Kitchen Orders</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {orders.map((o, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E4DB] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#1A1A1A]">Table {o.table}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <ul className="text-xs text-[#5A5A40] space-y-1 mb-3">
                    {o.items.map((item, j) => <li key={j} className="flex items-center space-x-1"><span className="w-1 h-1 rounded-full bg-[#5A5A40] inline-block" /><span>{item}</span></li>)}
                  </ul>
                  <div className="flex items-center space-x-1 text-xs text-[#5A5A40]">
                    <Clock className="w-3 h-3" /><span>{o.time} ago</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'sop' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Kitchen SOPs</h2>
            <div className="space-y-4">
              {sops.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
                  <h3 className="font-bold text-[#1A1A1A] mb-3">{s.title}</h3>
                  <ol className="space-y-2">
                    {s.steps.map((step, j) => (
                      <li key={j} className="flex items-start space-x-3 text-sm text-[#5A5A40]">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'checklist' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Daily Kitchen Checklist</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5 space-y-2">
              {checklist.map((item, i) => (
                <button key={i} onClick={() => toggle(i)} className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left cursor-pointer transition-colors ${checked[i] ? 'bg-green-50' : 'bg-[#FAF7F2] hover:bg-[#F0EDE6]'}`}>
                  {checked[i] ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-[#E8E4DB] shrink-0" />}
                  <span className={`text-sm ${checked[i] ? 'line-through text-[#5A5A40]' : 'text-[#1A1A1A]'}`}>{item}</span>
                </button>
              ))}
              <div className="pt-2 text-xs text-[#5A5A40] text-right">{Object.values(checked).filter(Boolean).length}/{checklist.length} completed</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
