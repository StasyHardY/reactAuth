/*eslint-disable*/
import React, { useContext, useEffect} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify"; 
import userService from './../services/user.service';
import { useState } from 'react';
import { setTokens } from './../services/localStorage.service';

const httpAuth=axios.create()

const AuthContext = React.createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};


export const AuthProvaider = ({ children }) => {
    const [error, setError] = useState(null);
    const [currentUser, setUser] = useState({})
   
    async function signUp({ email, password, ...rest }) {
        const keyFireBasePrivate = "AIzaSyADuDCXhyzp3foD-dSqHIWb_J99sB9PJW0";
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${keyFireBasePrivate}`;
        try {
            const { data } = await httpAuth.post(url, {
                email,
                password,
                returnSecureToken: true
            });
            setTokens(data);

            await createUser({ _id: data.localId, email, ...rest });
        } catch (error) {
            errorCatcher(error);
            const { code, message } = error.response.data.error;
            console.log(code, message);
            if (code === 400) {
                const errorObject = {
                    email: "Пользователь с таким email уже существует"
                };
                throw errorObject;
            }
        }
    }

    async function signIn({ email, password, ...rest }) {
        const keyFireBasePrivate = "AIzaSyADuDCXhyzp3foD-dSqHIWb_J99sB9PJW0";
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${keyFireBasePrivate}`;
        try {
            const { data } = await httpAuth.post(url, {
                email,
                password,
                returnSecureToken: true
            });
            setTokens(data);

            await createUser({ _id: data.localId, email, ...rest });
        } catch (error) {
            errorCatcher(error);
            const { code, message } = error.response.data.error;
            console.log(code, message);
            if (code === 400) {
                const errorObject = {
                    email: "Пользователя с таким email не существует "
                };
                throw errorObject;
            }
            
        }
    }
    async function createUser(data) {
        try {
            const {content} = userService.create(data)
            setUser(content)
        } catch (error) {
            errorCatcher(error);
        }


    }
    function errorCatcher(error) {
        const { message } = error.response.data;
        setError(message);
    }
    useEffect(() => {
        if (error !== null) {
            toast(error);
            setError(null);
        }
    }, [error]);
   return (
      <AuthContext.Provider value={{ signUp, signIn, currentUser }} >
          {children}
      </AuthContext.Provider>
  );
}

AuthProvaider.propTypes = {
   children: PropTypes.oneOfType([
       PropTypes.arrayOf(PropTypes.node),
       PropTypes.node
   ])
};

export default AuthProvaider