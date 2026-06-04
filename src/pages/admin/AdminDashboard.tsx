import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { Users, Activity, Shield, Settings, ChevronRight, Trophy } from 'lucide-react';

export default function AdminDashboard() {
  const sections = [
    { to: '/admin/users', icon: Users, label: 'Users', desc: 'Manage all registered users', color: 'bg-blue-100 text-blue-700' },
    { to: '/admin/host-applications', icon: Shield, label: 'Host Applications', desc: 'Review pending host requests', color: 'bg-yellow-100 text-yellow-700' },
    { to: '/admin/matches', icon: Activity, label: 'All Matches', desc: 'Monitor and manage matches', color: 'bg-green-100 text-green-700' },
    { to: '/admin/settings', icon: Settings, label: 'App Settings', desc: 'Configure platform settings', color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your cricket platform</p>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {sections.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}
              className="flex items-center justify-between bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>

        {/* Admin notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Admin Access</p>
            <p className="text-xs text-amber-700 mt-0.5">You have full platform access. Use with care.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
