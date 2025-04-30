'use client';

import React, { useEffect, useState } from 'react';
import { Cookies } from 'typescript-cookie';
import axios from 'axios';

export default function DiagnosticPage() {
  const [diagnostic, setDiagnostic] = useState<{
    setupComplete: boolean | null;
    authToken: string | null;
    apiStatus: { setup_required?: boolean; error?: string } | null;
    cookieList: Record<string, string>;
    status: string;
    message: string;
  }>({
    setupComplete: null,
    authToken: null,
    apiStatus: null,
    cookieList: {},
    status: 'Checking...',
    message: 'Examining cookie and local storage state',
  });

  const resetAllCookies = () => {
    // Get all cookies for diagnostic
    const allCookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) {
        allCookies[name] = value || '';
        // Remove this cookie
        Cookies.remove(name, { path: '/' });
        console.log(`Removed cookie: ${name}`);
      }
    });
    return allCookies;
  };

  useEffect(() => {
    const checkAndFix = async () => {
      try {
        // Step 1: Reset all cookies first
        const allCookies = resetAllCookies();
        localStorage.clear();
        console.log('Cleared all cookies and local storage');
        
        // Step 2: Check current state (should be cleared now)
        const setupComplete = false; // Force to false since we cleared cookies
        const authToken = null;
        
        console.log('Current state after clearing:', { setupComplete, authToken, cookies: allCookies });
        
        // Step 3: Direct API check
        let apiStatus = null;
        try {
          const response = await axios.get('http://localhost:8000/api/v1/status');
          apiStatus = response.data;
          console.log('API status:', apiStatus);
        } catch (error) {
          console.error('API check failed:', error);
          apiStatus = { error: 'Failed to fetch API status' };
        }
        
        // Step 4: Update diagnostics
        setDiagnostic({
          setupComplete,
          authToken,
          apiStatus,
          cookieList: allCookies,
          status: 'Fixed',
          message: 'Cleared all cookies and local storage',
        });
        
        // Step 5: Redirect based on API status, not just delayed redirect
        if (apiStatus && apiStatus.setup_required) {
          // If setup is required according to API, go to setup
          console.log('Redirecting to setup...');
          window.location.href = '/setup';
        } else {
          // If setup is not required, go to login
          console.log('Redirecting to login...');
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('Diagnostic error:', e);
        setDiagnostic(prev => ({
          ...prev,
          status: 'Error',
          message: `Error during diagnostic: ${e instanceof Error ? e.message : String(e)}`,
        }));
      }
    };
    
    checkAndFix();
  }, []);

  const handleForceSetup = () => {
    window.location.href = '/setup';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">AgentBase Diagnostic</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Cookie Status</h2>
            <p><strong>Setup Complete:</strong> {diagnostic.setupComplete === null ? 'Checking...' : diagnostic.setupComplete ? 'True' : 'False'}</p>
            <p><strong>Auth Token:</strong> {diagnostic.authToken ? 'Present' : 'Not found'}</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h2 className="text-lg font-semibold mb-2">API Status</h2>
            {diagnostic.apiStatus === null ? (
              <p>Checking API...</p>
            ) : diagnostic.apiStatus.error ? (
              <p className="text-red-500">{diagnostic.apiStatus.error}</p>
            ) : (
              <p><strong>Setup Required:</strong> {diagnostic.apiStatus.setup_required ? 'Yes' : 'No'}</p>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h2 className="text-lg font-semibold mb-2">All Cookies (Before Clearing)</h2>
            <div className="text-xs overflow-auto max-h-24">
              {Object.entries(diagnostic.cookieList).length > 0 ? (
                Object.entries(diagnostic.cookieList).map(([name, value]) => (
                  <div key={name} className="mb-1">
                    <strong>{name}:</strong> {value}
                  </div>
                ))
              ) : (
                <p>No cookies found</p>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Diagnostic Status</h2>
            <p><strong>Status:</strong> {diagnostic.status}</p>
            <p><strong>Message:</strong> {diagnostic.message}</p>
          </div>
          
          <button
            onClick={handleForceSetup}
            className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
          >
            Force Navigate to Setup
          </button>
        </div>
      </div>
    </div>
  );
}
