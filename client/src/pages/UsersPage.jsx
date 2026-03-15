import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/axiosInstance';

const SEARCH_DEBOUNCE_MS = 300;

const UsersPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
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
    const nextSearch = searchParams.get('search') ?? '';
    setSearchInput(nextSearch);
    setSearchTerm(nextSearch);
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput);
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        if (searchInput.trim()) {
          nextParams.set('search', searchInput);
        } else {
          nextParams.delete('search');
        }

        return nextParams;
      }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, setSearchParams]);

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
    return <div className="flex justify-center py-12 text-gray-500 dark:text-gray-400">Loading users...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Users</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{filteredUsers.length} user(s)</span>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="mb-6 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none"
      />

      {filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No results found for '{searchTerm}'</p>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{user.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
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
