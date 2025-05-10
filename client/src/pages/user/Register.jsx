import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    agreeToTerms: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = {};

    // Basic validation
    if (!formData.firstname.trim()) errors.firstname = 'First name is required';
    if (!formData.lastname.trim()) errors.lastname = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email address';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    // Simulate submission
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate delay
      setSuccess('Account successfully created!');
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        agreeToTerms: false,
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 bg-white shadow-2xl rounded-2xl p-10">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            Technician Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition"
            >
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-300 text-red-700 px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-300 text-green-700 px-4 py-3">
            {success}
          </div>
        )}

        <form className="grid grid-cols-1 gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
          {/* First Name */}
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              value={formData.firstname}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.firstname ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.firstname && (
              <p className="mt-1 text-sm text-red-600">{formErrors.firstname}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              value={formData.lastname}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.lastname ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.lastname && (
              <p className="mt-1 text-sm text-red-600">{formErrors.lastname}</p>
            )}
          </div>

          {/* Email */}
          <div className="col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address (optional)
            </label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 rounded-xl border shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>

          {/* Agree to Terms */}
          <div className="col-span-2 flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                formErrors.agreeToTerms ? 'border-red-500' : ''
              }`}
            />
            <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                Terms and Conditions
              </a>
            </label>
          </div>
          {formErrors.agreeToTerms && (
            <p className="col-span-2 text-sm text-red-600">{formErrors.agreeToTerms}</p>
          )}

          {/* Submit Button */}
          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
