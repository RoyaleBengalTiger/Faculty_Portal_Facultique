// components/Settings.jsx
import React from 'react';
import { User, Palette, Bell, Shield, Database, HelpCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-8"> {/* Much larger spacing */}
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-foreground">Appearance</h2>
          </div>
          <ThemeToggle />
        </section>

        {/* Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-8">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-foreground">Profile</h2>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Profile settings - Coming soon...</p>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-8">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-foreground">Notifications</h2>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Notification preferences - Coming soon...</p>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-8">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-foreground">Security</h2>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Security settings - Coming soon...</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
