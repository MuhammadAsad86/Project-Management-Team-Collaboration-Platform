import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();



  useEffect(() => {

    const savedUser = localStorage.getItem("user");


    if (savedUser) {

      setUser(JSON.parse(savedUser));

    }


    setLoading(false);


  }, []);





  const login = (userData, token) => {

    localStorage.setItem(
      "token",
      token
    );


    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    setUser(userData);

  };





  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    setUser(null);


    navigate("/login");

  };





  return (

    <AuthContext.Provider

      value={{
        user,
        loading,
        login,
        logout,
      }}

    >

      {children}

    </AuthContext.Provider>

  );

};





export const useAuth = () => {

  return useContext(AuthContext);

};