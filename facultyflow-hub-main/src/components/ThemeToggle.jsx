// components/ThemeToggle.jsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsLight(true);
      document.documentElement.classList.add('light');
    } else {
      setIsLight(false);
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);
    
    if (newIsLight) {
      // Switch to light mode
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      // Switch to dark mode
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-muted rounded-lg">
            {isLight ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-foreground">
              {isLight ? 'Light Mode' : 'Dark Mode'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLight ? 'Currently using light theme' : 'Currently using dark theme'}
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Light</span>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
              isLight 
                ? 'bg-primary shadow-glow' 
                : 'bg-muted border border-border'
            }`}
            style={{
              backgroundColor: isLight ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
            }}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-background shadow-md transition-all duration-300 ease-in-out"
              style={{
                transform: isLight ? 'translateX(4px)' : 'translateX(24px)',
                backgroundColor: 'hsl(var(--background))',
              }}
            />
          </button>
          <span className="text-xs text-muted-foreground">Dark</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
