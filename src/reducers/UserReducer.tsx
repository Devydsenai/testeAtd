// Action types constants for type safety
export const SET_AVATAR = 'SET_AVATAR';
export const SET_FAVORITES = 'SET_FAVORITES';
export const SET_APPOINTMENTS = 'SET_APPOINTMENTS';

// Type guards para validação
function isValidAvatar(avatar: unknown): avatar is string {
    return typeof avatar === 'string';
}

function isValidFavorites(favorites: unknown): favorites is string[] {
    return Array.isArray(favorites) && favorites.every(item => typeof item === 'string');
}

function isValidAppointments(appointments: unknown): appointments is Array<{id: string, date: string, title: string}> {
    return Array.isArray(appointments) && appointments.every(app => 
        app && 
        typeof app === 'object' &&
        'id' in app &&
        'date' in app &&
        'title' in app &&
        typeof app.id === 'string' &&
        typeof app.date === 'string' &&
        typeof app.title === 'string'
    );
}

export interface UserState {
    avatar: string;
    favorites: string[];
    appointments: Array<{
        id: string;
        date: string;
        title: string;
    }>;
}

export const initialState: UserState = {
    avatar: '',
    favorites: [],
    appointments: []
};

export interface UserAction {
    type: typeof SET_AVATAR | typeof SET_FAVORITES | typeof SET_APPOINTMENTS;
    payload?: {
        avatar?: string;
        favorites?: string[];
        appointments?: Array<{
            id: string;
            date: string;
            title: string;
        }>;
    };
}

export const UserReducer = (state: UserState, action: UserAction): UserState => {
    // Validação de inputs
    if (!action || !action.type) {
        return state;
    }

    switch (action.type) {
        case SET_AVATAR:
            // Validação com type guards para segurança
            if (action.payload && action.payload.avatar !== undefined && isValidAvatar(action.payload.avatar)) {
                return { ...state, avatar: action.payload.avatar };
            }
            return state;
            
        case SET_FAVORITES:
            if (action.payload && action.payload.favorites !== undefined && isValidFavorites(action.payload.favorites)) {
                return { ...state, favorites: action.payload.favorites };
            }
            return state;
            
        case SET_APPOINTMENTS:
            if (action.payload && action.payload.appointments !== undefined && isValidAppointments(action.payload.appointments)) {
                return { ...state, appointments: action.payload.appointments };
            }
            return state;
            
        default:
            return state;
    }
};

