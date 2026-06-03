import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Calendar,
  ClipboardList,
  PlusCircle,
  Settings,
} from 'lucide-react';

interface QuickLinkProps {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const QuickLink: React.FC<QuickLinkProps> = ({
  to,
  label,
  description,
  icon,
}) => (
  <Link
    to={to}
    className="flex items-start gap-4 bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
  >
    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
  </Link>
);

const quickLinks: QuickLinkProps[] = [
  {
    to: '/host/tournaments',
    label: 'My Tournaments',
    description: 'View and manage your tournaments',
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    to: '/host/matches/create',
    label: 'Create Match',
    description: 'Schedule a new match',
    icon: <PlusCircle className="w-5 h-5" />,
  },
  {
    to: '/host/teams',
    label: 'Manage Teams',
    description: 'View and edit your teams',
    icon: <Users className="w-5 h-5" />,
  },
  {
    to: '/host/players',
    label: 'Manage Players',
    description: 'Manage player rosters',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    to: '/host/matches',
    label: 'All Matches',
    description: 'View upcoming and past matches',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    to: '/host/settings',
    label: 'Settings',
    description: 'Configure your host preferences',
    icon: <Settings className="w-5 h-5" />,
  },
];

const HostPage: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage your tournaments, matches, teams and players.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <QuickLink key={link.to} {...link} />
        ))}
      </div>
    </div>
  );
};

export default HostPage;
