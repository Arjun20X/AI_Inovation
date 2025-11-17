import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext";
// Assuming you have a utility function for Tailwind class names (cn)
const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear the error when the user starts typing again
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Validation Failed", {
        description: "Please fill out all required fields correctly.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Axios request is cleaner and automatically handles JSON stringify/parse
      const { data } = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Use the login function from AuthContext
      login(data);

      toast.success("Registration Successful", {
        description:
          "Your account has been created successfully. Redirecting...",
      });

      // Redirect to the dashboard
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";

      toast.error("Registration Failed", {
        description: message,
      });

      // If the message is "User already exists", we should display it clearly
      if (message.includes("User already exists")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered.",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm">
              Join us today and get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800",
                    errors.name
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-slate-600 focus:ring-blue-500"
                  )}
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800",
                    errors.email
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-slate-600 focus:ring-blue-500"
                  )}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800",
                    errors.password
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-slate-600 focus:ring-blue-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800",
                    errors.confirmPassword
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-slate-600 focus:ring-blue-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 mt-6",
                isLoading
                  ? "bg-blue-500/50 text-white cursor-not-allowed opacity-75"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-95"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </div>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login" // Use /login path
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-slate-400 text-xs">
          <p>
            By creating an account, you agree to our{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
