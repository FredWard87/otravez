import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from './App';

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/verifyToken`, { token });
          setUserData({ ...response.data, token });
        } else {
          setUserData(null);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setUserData(null);
      }
    };

    verifyToken();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export default AuthProvider;