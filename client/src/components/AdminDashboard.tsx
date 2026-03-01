import React, { useState } from 'react';
import { LogOut, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// We will import specific test editors here as we build them
import ReadingTestEditor from './ReadingTestEditor';
interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');

    const handleLogout = () => {
        logout();
        onLogout();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'reading':
                return <ReadingTestEditor />;
            case 'listening':
                return <div className="p-6 bg-white rounded-lg shadow">Listening Test Editor Coming Soon...</div>;
            case 'writing':
                return <div className="p-6 bg-white rounded-lg shadow">Writing Test Editor Coming Soon...</div>;
            case 'speaking':
                return <div className="p-6 bg-white rounded-lg shadow">Speaking Test Editor Coming Soon...</div>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Top Navigation */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">IELTS Admin CMS</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Logged in as: {user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex space-x-8">
                {/* Sidebar Navigation */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('reading')}
                            className={`${activeTab === 'reading'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                        >
                            <BookOpen
                                className={`${activeTab === 'reading' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    } flex-shrink-0 mr-3 h-6 w-6`}
                            />
                            Reading Tests
                        </button>

                        <button
                            onClick={() => setActiveTab('listening')}
                            className={`${activeTab === 'listening'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                        >
                            <Headphones
                                className={`${activeTab === 'listening' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    } flex-shrink-0 mr-3 h-6 w-6`}
                            />
                            Listening Tests
                        </button>

                        <button
                            onClick={() => setActiveTab('writing')}
                            className={`${activeTab === 'writing'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                        >
                            <PenTool
                                className={`${activeTab === 'writing' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    } flex-shrink-0 mr-3 h-6 w-6`}
                            />
                            Writing Tests
                        </button>

                        <button
                            onClick={() => setActiveTab('speaking')}
                            className={`${activeTab === 'speaking'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                        >
                            <Mic
                                className={`${activeTab === 'speaking' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                    } flex-shrink-0 mr-3 h-6 w-6`}
                            />
                            Speaking Tests
                        </button>
                    </nav>
                </div>

                {/* Content Panel */}
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
