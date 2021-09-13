import { createContext, useContext, useEffect, useReducer } from 'react';
import Axios from 'axios';

// reducer
const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'LOGIN':
      return { ...state, authenticated: true, user: payload };
    case 'LOGOUT':
      return { ...state, authenticated: false, user: null };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      throw new Error(`Unknow action type: ${type}`);
  }
};

// initial state
const initialState = {
  authenticated: false,
  user: null,
  loading: true,
};

// create context
const AuthContext = createContext({});

// context provider
export const AuthProvider = ({ children }) => {
  const [state, defaultDispatch] = useReducer(reducer, initialState);

  const dispatch = (type, payload) => defaultDispatch({ type, payload });

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await Axios.get('/auth/me');
        dispatch('LOGIN', res.data);
      } catch (err) {
        console.log(err);
      } finally {
        dispatch('STOP_LOADING');
      }
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
