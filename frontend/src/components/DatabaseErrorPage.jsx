import React from 'react';
import { Link } from 'react-router-dom';
import { Database, AlertTriangle, RefreshCw } from 'lucide-react';

const DatabaseErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Database Connection Error</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-700">MongoDB Not Running</span>
          </div>
          <p className="text-red-600 text-sm">The application cannot connect to the MongoDB database.</p>
        </div>
        
        <div className="text-left mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Possible Solutions:</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-blue-100 rounded-full text-blue-600 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">1</span>
              <span>Make sure MongoDB is installed on your system</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-blue-100 rounded-full text-blue-600 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">2</span>
              <span>Verify that the MongoDB service is running</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 bg-blue-100 rounded-full text-blue-600 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">3</span>
              <span>Check if the connection string in the backend .env file is correct</span>
            </li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <a 
            href="https://www.mongodb.com/try/download/community" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download MongoDB
          </a>
          
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </button>
          
          <Link 
            to="/"
            className="block text-blue-600 hover:text-blue-800 text-sm mt-4"
          >
            Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DatabaseErrorPage;