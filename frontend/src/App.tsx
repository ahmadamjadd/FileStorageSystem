import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { LogOut } from 'lucide-react';

// A simple dashboard placeholder. We'll build the real one in Step 14.
function DashboardPlaceholder() {
  const token = localStorage.getItem('token');
  
  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">Cloud File Storage</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </header>
      <main className="max-w-7xl mx-auto py-12 px-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-900 mb-4">You are logged in!</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          We have successfully configured the React Router, Tailwind CSS UI, and Axios Interceptors to handle JWT tokens securely. 
        </p>
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 inline-block text-left">
          <p className="text-sm font-mono text-slate-600 break-all w-[300px]">
            <span className="text-indigo-600 font-bold block mb-2">Your JWT Token:</span> 
            {token.substring(0, 40)}...
          </p>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<DashboardPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
