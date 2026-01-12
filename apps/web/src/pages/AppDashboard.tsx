import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import CreateNewView from './dashboard/CreateNewView';
import ExploreView from './dashboard/ExploreView';
import ProfileView from './dashboard/ProfileView';

const AppDashboard: FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Navigate to="/app/create" replace />} />
        <Route path="create" element={<CreateNewView />} />
        <Route path="explore" element={<ExploreView />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="profile/:walletAddress" element={<ProfileView />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AppDashboard;
