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