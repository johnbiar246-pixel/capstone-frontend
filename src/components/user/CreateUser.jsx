import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPersonAdd,
  MdRefresh,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
} from "react-icons/md";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../../api/Auth.js";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "CASHIER",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all fields");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await createUser(formData);
      if (response.data.success) {
        setSuccess("User created successfully!");
        setFormData({ name: "", email: "", password: "", role: "CASHIER" });
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to create user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-6"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-4xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
      >
        Create User Account
      </motion.h1>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6"
        >
          {success}
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="p-3 bg-green-100 rounded-xl">
            <MdPersonAdd className="w-6 h-6 text-green-600" />
          </span>
          <h2 className="text-xl font-semibold text-gray-800">
            Create New User
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="juandelacruz@companyname.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="******"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-fit px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
            >
              <option value="CASHIER">Cashier</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <motion.button
            type="submit"
            disabled={submitting}
            className="w-fit px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <MdPersonAdd className="w-4 h-4" />
                Create User
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-blue-100 rounded-xl">
              <MdRefresh className="w-6 h-6 text-blue-600" />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">
              Existing Users ({users.length})
            </h2>
          </div>
          <motion.button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdRefresh className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
        <AnimatePresence>
          {users.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center py-8"
            >
              No users yet. Create one above!
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-x-auto"
            >
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user, index) => {
                    const isEditing = editingUserId === user.id;
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  name: e.target.value,
                                })
                              }
                              className="px-2 py-1 border border-gray-300 rounded-lg"
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isEditing ? (
                            <input
                              type="email"
                              value={editFormData.email}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  email: e.target.value,
                                })
                              }
                              className="px-2 py-1 border border-gray-300 rounded-lg"
                            />
                          ) : (
                            user.email
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium capitalize">
                          {isEditing ? (
                            <select
                              value={editFormData.role}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  role: e.target.value,
                                })
                              }
                              className="px-2 py-1 border border-gray-300 rounded-lg"
                            >
                              <option value="CASHIER">Cashier</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          ) : (
                            user.role || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    setError("");
                                    const payload = {
                                      name: editFormData.name,
                                      email: editFormData.email,
                                      role: editFormData.role,
                                    };
                                    if (editFormData.password.trim()) {
                                      payload.password =
                                        editFormData.password.trim();
                                    }
                                    const response = await updateUser(
                                      user.id,
                                      payload,
                                    );
                                    if (response.data.success) {
                                      setSuccess("User updated successfully!");
                                      setEditingUserId(null);
                                      setEditFormData({
                                        name: "",
                                        email: "",
                                        role: "CASHIER",
                                        password: "",
                                      });
                                      fetchUsers();
                                      setTimeout(() => setSuccess(""), 3000);
                                    } else {
                                      setError(
                                        response.data.message ||
                                          "Failed to update user",
                                      );
                                    }
                                  } catch (err) {
                                    setError(
                                      err.response?.data?.message ||
                                        "Failed to update user",
                                    );
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                              >
                                <MdSave /> Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUserId(null);
                                  setEditFormData({
                                    name: "",
                                    email: "",
                                    role: "CASHIER",
                                    password: "",
                                  });
                                }}
                                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1"
                              >
                                <MdClose /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setEditFormData({
                                    name: user.name || "",
                                    email: user.email || "",
                                    role: user.role || "CASHIER",
                                    password: "",
                                  });
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                              >
                                <MdEdit /> Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    !window.confirm(
                                      `Delete user "${user.name}"?`,
                                    )
                                  )
                                    return;
                                  try {
                                    setError("");
                                    const response = await deleteUser(user.id);
                                    if (response.data.success) {
                                      setSuccess("User deleted successfully!");
                                      fetchUsers();
                                      setTimeout(() => setSuccess(""), 3000);
                                    } else {
                                      setError(
                                        response.data.message ||
                                          "Failed to delete user",
                                      );
                                    }
                                  } catch (err) {
                                    setError(
                                      err.response?.data?.message ||
                                        "Failed to delete user",
                                    );
                                  }
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                              >
                                <MdDelete /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CreateUser;
