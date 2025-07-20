import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getInitials,
  loadUser,
  updateUser,
  clearError,
} from "../store/authSlice";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user, status, isLoggedIn } = useSelector((state) => state.auth);
  const imageRef = useRef();

  const [isEditing, setIsEditing] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    old: false,
    new: false,
    confirm: false,
  });

const [formData, setFormData] = useState({
  name: "",
  phone: "",
  address: "",
  profileImage: "",   
  profileImageFile: null,  
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});


  useEffect(() => {
    if (isLoggedIn) {
      dispatch(loadUser());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: typeof user.phone === "string" ? user.phone : "",
        address: typeof user.address === "string" ? user.address : "",
        profileImage: user.profileImage || "",
      }));
      dispatch(clearError());
    }
  }, [user, dispatch]);

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setFormData((prev) => ({
    ...prev,
    profileImageFile: file, 
  }));

  const reader = new FileReader();
  reader.onloadend = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: reader.result, 
    }));
  };
  reader.readAsDataURL(file);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append("name", formData.name);
  form.append("phone", formData.phone);
  form.append("address", formData.address);
  form.append("oldPassword", formData.oldPassword);
  form.append("newPassword", formData.newPassword);
  form.append("confirmNewPassword", formData.confirmNewPassword);

  if (formData.profileImageFile) {
    form.append("profileImage", formData.profileImageFile);
  }

  const result = await dispatch(updateUser(form));

  if (updateUser.fulfilled.match(result)) {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  } else {
    toast.error(result.payload || "Update failed");
  }
};



  if (status === "loading" && !user) {
    return <div className="text-center py-10 text-gray-600">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-red-600">User not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-white p-6 rounded-md shadow-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4 w-full">
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile"
                onClick={() => isEditing && imageRef.current.click()}
                className="w-20 h-20 rounded-full object-cover border cursor-pointer"
              />
            ) : (
              <div
                onClick={() => isEditing && imageRef.current.click()}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-primary text-white text-2xl font-bold font-nunito select-none cursor-pointer"
              >
                {getInitials(user?.name || "")}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-xl font-bold font-nunito">
                {formData.name || "Your Name"}
              </h2>
              <p className="text-gray-600 font-nunito">{user?.email || ""}</p>

              {isEditing && (
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              )}

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="sm:hidden mt-3 bg-primary text-white px-4 py-1.5 rounded text-sm font-nunito hover:bg-blue-700 transition"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="hidden sm:inline-block bg-primary text-white px-5 py-2 rounded text-sm font-nunito hover:bg-blue-700 transition"
            >
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
                       <label className="block text-sm  font-medium font-nunito">Name</label>
           <input
  name="name"
  value={formData.name || ""}
  onChange={handleChange}
  disabled={!isEditing}
  className="mt-1 w-full px-3 mb-2 py-2 border rounded-md shadow-sm font-nunito bg-gray-100 cursor-not-allowed"
/>
            <label className="block text-sm font-medium font-nunito">Email</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm font-nunito bg-gray-100 cursor-not-allowed"
            />
 
          </div>

          {["phone", "address"].map((field) => {
            const shouldShow =
              isEditing || (formData[field] && formData[field].trim() !== "");

            if (!shouldShow) return null;

            return (
              <div key={field}>
                <label className="block text-sm font-medium font-nunito capitalize">
                  {field}
                </label>
                {field === "address" ? (
                  <textarea
                    name={field}
                    rows={3}
                    disabled={!isEditing}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm font-nunito ${
                      isEditing
                        ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 cursor-not-allowed"
                    }`}
                  />
                ) : (
                  <input
                    type="tel"
                    name={field}
                    disabled={!isEditing}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm font-nunito ${
                      isEditing
                        ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-gray-100 cursor-not-allowed"
                    }`}
                  />
                )}
              </div>
            );
          })}

          {isEditing && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Old Password", field: "old", name: "oldPassword" },
                  { label: "New Password", field: "new", name: "newPassword" },
                  {
                    label: "Confirm New Password",
                    field: "confirm",
                    name: "confirmNewPassword",
                  },
                ].map(({ label, field, name }) => (
                  <div className="relative" key={name}>
                    <label className="block text-sm font-medium font-nunito">
                      {label}
                    </label>
                    <input
                      type={passwordVisibility[field] ? "text" : "password"}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-nunito pr-10"
                    />
                    <span
                      onClick={() => togglePasswordVisibility(field)}
                      className="absolute bottom-2.5 right-3 cursor-pointer text-gray-500"
                    >
                      {passwordVisibility[field] ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-nunito text-base"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 font-nunito text-base"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
