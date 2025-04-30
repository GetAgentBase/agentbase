'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col justify-center items-center p-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            {/* Replace with your actual logo */}
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="w-full sm:mx-auto sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          AgentBase &copy; {new Date().getFullYear()} &mdash; 
          <Link href="/" className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthLayout; 