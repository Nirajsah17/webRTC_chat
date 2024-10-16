import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      navigate('/chat');
    }
  };

  return (
    React.createElement('div', { className: 'flex items-center justify-center min-h-screen bg-gray-100' },
      React.createElement('div', { className: 'p-8 bg-white rounded-lg shadow-md w-full max-w-md' },
        React.createElement('div', { className: 'flex items-center justify-center mb-6' },
          React.createElement(MessageSquare, { className: 'w-12 h-12 text-blue-500 mr-2' }),
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-800' }, 'P2P Chat')
        ),
        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { htmlFor: 'username', className: 'block text-sm font-medium text-gray-700' }, 'Username'),
            React.createElement('input', {
              type: 'text',
              id: 'username',
              value: username,
              onChange: (e) => setUsername(e.target.value),
              className: 'mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
              placeholder: 'Enter a unique username',
              required: true
            })
          ),
          React.createElement('button', {
            type: 'submit',
            className: 'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }, 'Join Chat')
        )
      )
    )
  );
};

export default Login;
