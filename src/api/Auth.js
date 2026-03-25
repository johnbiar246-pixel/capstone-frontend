import axios from "axios";
export const loginUser = (email, password) =>
  axios.post("/api/auth/signin", { email, password });

export const logoutUser = async () => {
  try {
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
  } catch (error) {
    console.log("Logout API call failed, proceeding with client logout");
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }
};

export const createUser = (data) =>
  axios.post("/api/auth/create-user", data, { withCredentials: true });

export const getUsers = () =>
  axios.get("/api/auth/users", { withCredentials: true });

export const updateUser = (id, data) =>
  axios.put(`/api/auth/users/${id}`, data, { withCredentials: true });

export const deleteUser = (id) =>
  axios.delete(`/api/auth/users/${id}`, { withCredentials: true });
