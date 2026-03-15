import User from '../models/userModel.js';

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false });
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id (soft delete)
export const softDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User soft deleted', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/:id/restore
export const restoreUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'User restored', data: { user } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
