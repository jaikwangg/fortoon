'use client'
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from "@/contexts/SettingsContext";
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import type { FormData, FormErrors } from '@/lib/types';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: '',
    sex: '',
    email: '',
    profilePic: null,
    age: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const { theme } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'file' ? (e.target as HTMLInputElement).files?.[0] || null : value
    }));
    // Clear the error for this field when it's changed
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
        return;
    }

    const formDataToSend = new FormData();
    
    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
        const value = formData[key];
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });
  

    try {
      const response = await fetch('api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        if (errorData.msg && errorData.msg.issues) {
          const serverErrors : FormErrors = {};
          errorData.msg.issues.forEach((issue: { path: string[], message: string }) => {
            serverErrors[issue.path[0]] = issue.message;
          });
          setErrors(serverErrors);
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (formData.username.length < 4) {
        newErrors.username = 'Username must contain at least 4 characters';
      }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters';
    }
    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }
    if (formData.sex !== 'm' && formData.sex !== 'f') {
      newErrors.sex = "Sex must be either 'm' or 'f'";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className={`p-8 rounded-lg shadow-md w-full max-w-md ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
        {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
              placeholder="Your username"
              required
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
              placeholder="Your password"
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
              placeholder="Your display name"
              required
            />
            {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="sex" className="block text-sm font-medium mb-2">
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
              required
            >
              <option value="">Select</option>
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
            {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
              placeholder="Your email"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="profilepic" className="block text-sm font-medium mb-2">
              Profile Picture
            </label>
            <input
              type="file"
              id="profilepic"
              name="profilepic"
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
              accept="image/*"
            />
            {errors.profilePic && <p className="text-red-500 text-xs mt-1">{errors.profilepic}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="age" className="block text-sm font-medium mb-2">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
              }`}
              placeholder="Your age"
              required
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            Register
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;