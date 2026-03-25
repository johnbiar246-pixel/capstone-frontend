import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPersonAdd,
  MdRefresh,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdCancel,
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
    confirmPassword: "",
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

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Email validation state
  const [emailError, setEmailError] = useState("");
  const [editEmailError, setEditEmailError] = useState("");

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

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength <= 2) return { label: "Weak", color: "bg-red-500" };
    if (strength <= 4) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });

    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleEditEmailChange = (e) => {
    const email = e.target.value;
    setEditFormData({ ...editFormData, email });

    if (email && !validateEmail(email)) {
      setEditEmailError("Please enter a valid email address");
    } else {
      setEditEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all fields");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await createUser(submitData);
      if (response.data.success) {
        setSuccess("User created successfully!");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "CASHIER",
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Create user error:", err);
      console.error("Error response:", err.response);
      console.error("Error request:", err.request);

      let errorMessage = "Failed to create user";

      if (err.response) {
        // Server responded with error
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response (network/CORS issue)
        errorMessage =
          "Network error: Cannot connect to server. Please check if the backend is running.";
      } else {
        // Something else happened
        errorMessage = err.message || "An unexpected error occurred";
      }

      setError(errorMessage);
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

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-4 sm:p-6"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
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

      {/* Create User Form */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="p-2 sm:p-3 bg-green-100 rounded-xl">
            <MdPersonAdd className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Create New User
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Name Field */}
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
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  emailError ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="juandelacruz@companyname.com"
                required
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="******"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="w-5 h-5" />
                  ) : (
                    <MdVisibility className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {strengthInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Min 6 chars, uppercase, lowercase, number, special char
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="******"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <MdVisibilityOff className="w-5 h-5" />
                  ) : (
                    <MdVisibility className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                    <MdCheckCircle className="w-3 h-3" /> Passwords match
                  </p>
                )}
            </div>

            {/* Role Field */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              >
                <option value="CASHIER">Cashier</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting || emailError}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Users List */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 sm:p-3 bg-blue-100 rounded-xl">
              <MdRefresh className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Existing Users ({users.length})
            </h2>
          </div>
          <motion.button
            onClick={fetchUsers}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2"
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
              className="overflow-x-auto -mx-4 sm:mx-0"
            >
              <table className="w-full table-auto min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {isEditing ? (
                            <div>
                              <input
                                type="email"
                                value={editFormData.email}
                                onChange={handleEditEmailChange}
                                className={`w-full px-2 py-1 border rounded-lg ${
                                  editEmailError
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {editEmailError && (
                                <p className="text-red-500 text-xs mt-1">
                                  {editEmailError}
                                </p>
                              )}
                            </div>
                          ) : (
                            user.email
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium capitalize">
                          {isEditing ? (
                            <select
                              value={editFormData.role}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  role: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                            >
                              <option value="CASHIER">Cashier</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          ) : (
                            user.role || "-"
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {isEditing ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <div className="w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
                                <div className="relative w-full sm:w-auto">
                                  <input
                                    type={
                                      showEditPassword ? "text" : "password"
                                    }
                                    value={editFormData.password}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        password: e.target.value,
                                      })
                                    }
                                    className="w-full px-2 py-1 pr-8 border border-gray-300 rounded-lg"
                                    placeholder="New password (optional)"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowEditPassword(!showEditPassword)
                                    }
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                  >
                                    {showEditPassword ? (
                                      <MdVisibilityOff className="w-4 h-4" />
                                    ) : (
                                      <MdVisibility className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      if (editEmailError) {
                                        setError(
                                          "Please fix email validation errors",
                                        );
                                        return;
                                      }
                                      try {
                                        setError("");
                                        const payload = {
                                          name: editFormData.name,
                                          email: editFormData.email,
                                          role: editFormData.role,
                                        };
                                        if (editFormData.password.trim()) {
                                          if (
                                            editFormData.password.length < 6
                                          ) {
                                            setError(
                                              "Password must be at least 6 characters",
                                            );
                                            return;
                                          }
                                          payload.password =
                                            editFormData.password.trim();
                                        }
                                        const response = await updateUser(
                                          user.id,
                                          payload,
                                        );
                                        if (response.data.success) {
                                          setSuccess(
                                            "User updated successfully!",
                                          );
                                          setEditingUserId(null);
                                          setEditFormData({
                                            name: "",
                                            email: "",
                                            role: "CASHIER",
                                            password: "",
                                          });
                                          setShowEditPassword(false);
                                          fetchUsers();
                                          setTimeout(
                                            () => setSuccess(""),
                                            3000,
                                          );
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
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
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
                                      setEditEmailError("");
                                      setShowEditPassword(false);
                                    }}
                                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1 text-sm"
                                  >
                                    <MdClose /> Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setEditFormData({
                                    name: user.name || "",
                                    email: user.email || "",
                                    role: user.role || "CASHIER",
                                    password: "",
                                  });
                                  setEditEmailError("");
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
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
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm"
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
