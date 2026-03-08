import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';

const UsersPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setAllUsers(res.data.data.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(allUsers);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      allUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, allUsers]);

  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500">Loading users...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <span className="text-sm text-gray-500">{filteredUsers.length} user(s)</span>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full rounded border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
      />

      {filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">No results found for '{searchTerm}'</p>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between rounded border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
