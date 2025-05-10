import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { validateEmail, validateRequired } from '../../utils/validationUtils';

function Login() {
    const { login } = useUser();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: ''
    });
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

        const validateForm = () => {
        const errors = {
            email: '',
            password: ''
        };

        // Validate email
        if (!validateRequired(formData.email)) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Validate password
        if (!validateRequired(formData.password)) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    }; 

       const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        // Clear error when user starts typing
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };
       const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const result = await login(formData.email, formData.password);
        if (!result.success) {
            setServerError(result.error);
        }
        setLoading(false);
    };

    return(
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {serverError && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {serverError}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;