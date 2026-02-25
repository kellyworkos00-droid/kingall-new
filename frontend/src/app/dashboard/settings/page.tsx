'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      {/* User Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input type="text" value={user?.name} disabled className="input bg-gray-50" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={user?.email} disabled className="input bg-gray-50" />
          </div>
          <div>
            <label className="label">Role</label>
            <input type="text" value={user?.role} disabled className="input bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
