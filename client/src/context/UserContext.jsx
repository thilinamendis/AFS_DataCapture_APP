import { removeItem } from "framer-motion";
import { createContext,useContext,useState,useEffect, Children } from "react";
import { useNavigate } from "react-router-dom";


const UserContext = createContext();

export const UseProvider = ({Children})=>{
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(()=>{
        const token = localStorage.getItem('token');
        if(token){
            fetchUserData(token);
        }else{
            setLoading(false);
        }
    },[])

    const fetchUserData = async(token) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me',{
                headers:{
                    'Authorization' : `Bearer ${token}`
                }
            });
            if(response.ok){
                const userData = await response.json();
                setUser(userData);
                return userData;
            }else{
                localStorage.removeItem('token');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user data',error);
            localStorage,removeItem('token');
            return null;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login',{
                method: 'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,password}),
            });
            const data = await response.json()

            if (!response.ok){
                throw new Error(data.message || 'Login Failed');
            }
            localStorage.setItem('token',data.token);

            const userData = await fetchUserData(data.token);

            if(!userData){
                throw new Error('Failed to fetch user data');
            }

            if(userData.isAdmin){
                navigate('/admin');
            }else{
               switch (userData.userType){
                case 'technician':
                    navigate('/technicion');
                    break;
                default:
                    navigate('/');    
               }
            }
            return {success:true};
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

     const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

        const updateUser = async (userData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }

            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return(
        <useContext.Provider value={{
            user,
            loading,
            login,
            logout,
            register,
            updateUser
        }}>
            {Children}
        </useContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 