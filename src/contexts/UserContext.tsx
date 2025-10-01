import React, { createContext, useReducer, ReactNode, useCallback, useContext } from 'react';
import { 
    initialState, 
    UserReducer, 
    UserState, 
    UserAction, 
    SET_AVATAR, 
    SET_FAVORITES, 
    SET_APPOINTMENTS 
} from '../reducers/UserReducer';

interface UserContextType {
    state: UserState;
    dispatch: React.Dispatch<UserAction>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
    children: ReactNode;
}

export default function UserContextProvider({ children }: UserContextProviderProps) {
    const [state, dispatch] = useReducer(UserReducer, initialState);

    // Wrapper seguro para dispatch para evitar erros
    const safeDispatch = useCallback((action: UserAction) => {
        try {
            dispatch(action);
        } catch (error) {
            console.warn('Error dispatching action:', error);
        }
    }, []);

    // Validação adicional de context provider
    const contextValue = {
        state,
        dispatch: safeDispatch
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

// Hook customizado para usar o contexto com proteção contra erros
export function useUserContext(): UserContextType {
    const context = useContext(UserContext);
    
    if (context === undefined) {
        // Fallback estável para evitar crashes
        return {
            state: initialState,
            dispatch: () => {
                console.warn('useUserContext was called outside of UserContextProvider');
            }
        };
    }
    
    return context;
}

// Hooks auxiliares para operações específicas
export function useUserActions() {
    const { dispatch } = useUserContext();
    
    const setAvatar = useCallback((avatar: string) => {
        // Validação preventiva de safety
        if (typeof avatar === 'string') {
            dispatch({
                type: SET_AVATAR,
                payload: { avatar }
            });
        } else {
            console.warn('setAvatar: invalid avatar parameter', typeof avatar);
        }
    }, [dispatch]);
    
    const setFavorites = useCallback((favorites: string[]) => {
        // Validação dos dados de entrada
        if (Array.isArray(favorites) && favorites.every(f => typeof f === 'string')) {
            dispatch({
                type: SET_FAVORITES,
                payload: { favorites }
            });
        } else {
            console.warn('setFavorites: invalid favorites array', typeof favorites);
        }
    }, [dispatch]);
    
    const setAppointments = useCallback((appointments: Array<{ id: string; date: string; title: string; }>) => {
        // Validação de estrutura appointment
        if (Array.isArray(appointments) && appointments.length >= 0) {
            dispatch({
                type: SET_APPOINTMENTS,
                payload: { appointments }
            });
        } else {
            console.warn('setAppointments: invalid appointments', typeof appointments);
        }
    }, [dispatch]);
    
    return { setAvatar, setFavorites, setAppointments };
}
