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