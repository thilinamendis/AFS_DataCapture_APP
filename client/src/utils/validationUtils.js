export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
    return value && value.trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
    return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
    return value && value.length <= maxLength;
};

export const validateDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    return selectedDate >= today;
};