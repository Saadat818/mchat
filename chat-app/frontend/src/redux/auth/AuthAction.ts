import {
    ApiResponseDTO, AuthenticationErrorDTO,
    LoginRequestDTO,
    LoginResponseDTO,
    SignUpRequestDTO,
    UpdateUserRequestDTO,
    UserDTO
} from "./AuthModel";
import * as actionTypes from './AuthActionType';
import {BASE_API_URL, TOKEN} from "../../config/Config";
import {AUTHORIZATION_PREFIX} from "../Constants";
import {AppDispatch} from "../Store";
import {clearSession, isSessionExpired, setSessionExpiry} from "../../utils/session";

const AUTH_PATH = 'auth';
const USER_PATH = 'api/users';

export const register = (data: SignUpRequestDTO) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        dispatch({type: actionTypes.AUTH_LOADING, payload: true});

        const res: Response = await fetch(`${BASE_API_URL}/${AUTH_PATH}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const resData = await res.json();

        if (!res.ok) {
            const errorMessage = resData.message || resData.error || 'Ошибка при регистрации';
            dispatch({type: actionTypes.AUTH_ERROR, payload: errorMessage});
            return;
        }

        if (resData.token) {
            localStorage.setItem(TOKEN, resData.token);
            setSessionExpiry();
            console.log('Stored token');
        }
        console.log('User registered: ', resData);
        dispatch({type: actionTypes.REGISTER, payload: resData});
    } catch (error: any) {
        console.error('Register failed: ', error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: 'Сервер временно недоступен. Попробуйте позже.'});
    }
};

export const loginUser = (data: LoginRequestDTO) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        dispatch({type: actionTypes.AUTH_LOADING, payload: true});

        const res: Response = await fetch(`${BASE_API_URL}/${AUTH_PATH}/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const resData = await res.json();

        if (!res.ok) {
            const errorMessage = resData.message || resData.error || 'Неверный логин или пароль';
            dispatch({type: actionTypes.AUTH_ERROR, payload: errorMessage});
            return;
        }

        if (resData.token) {
            localStorage.setItem(TOKEN, resData.token);
            setSessionExpiry();
            console.log('Stored token');
        }
        console.log('User logged in: ', resData);
        dispatch({type: actionTypes.LOGIN_USER, payload: resData});
    } catch (error: any) {
        console.error('Login failed: ', error);
        dispatch({type: actionTypes.AUTH_ERROR, payload: 'Сервер авторизации временно недоступен. Попробуйте позже.'});
    }
};

export const clearAuthError = () => (dispatch: AppDispatch): void => {
    dispatch({type: actionTypes.CLEAR_AUTH_ERROR});
};

export const currentUser = (token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        if (isSessionExpired()) {
            clearSession();
            dispatch({type: actionTypes.LOGOUT_USER, payload: null});
            dispatch({type: actionTypes.REQ_USER, payload: null});
            return;
        }
        const res: Response = await fetch(`${BASE_API_URL}/${USER_PATH}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        const resData: UserDTO | AuthenticationErrorDTO = await res.json();
        if ('message' in resData && resData.message === 'Authentication Error') {
            clearSession();
            console.log('Removed invalid token from local storage');
            return;
        }
        console.log('Fetched current user: ', resData);
        dispatch({type: actionTypes.REQ_USER, payload: resData});
    } catch (error: any) {
        console.error('Fetching current user failed: ', error);
    }
};

export const searchUser = (data: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${USER_PATH}/search?name=${data}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            }
        });

        const resData: UserDTO[] = await res.json();
        console.log('Searched user data: ', resData);
        dispatch({type: actionTypes.SEARCH_USER, payload: resData});
    } catch (error: any) {
        console.error('Searching user failed: ', error);
    }
};

export const updateUser = (data: UpdateUserRequestDTO, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
            body: JSON.stringify(data),
        });

        const resData: ApiResponseDTO = await res.json();
        console.log('User updated: ', resData);
        dispatch({type: actionTypes.UPDATE_USER, payload: resData});
    } catch (error: any) {
        console.error('User update failed: ', error);
    }
};

export const logoutUser = () => async (dispatch: AppDispatch): Promise<void> => {
    clearSession();
    dispatch({type: actionTypes.LOGOUT_USER, payload: null});
    dispatch({type: actionTypes.REQ_USER, payload: null});
    console.log('User logged out');
};

export const pinChat = (chatId: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/chats/${chatId}/pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        if (res.ok) {
            console.log('Chat pinned: ', chatId);
            dispatch({type: actionTypes.PIN_CHAT, payload: chatId});
        }
    } catch (error: any) {
        console.error('Pin chat failed: ', error);
    }
};

export const unpinChat = (chatId: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/chats/${chatId}/pin`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        if (res.ok) {
            console.log('Chat unpinned: ', chatId);
            dispatch({type: actionTypes.UNPIN_CHAT, payload: chatId});
        }
    } catch (error: any) {
        console.error('Unpin chat failed: ', error);
    }
};

export const muteChat = (chatId: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/chats/${chatId}/mute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        if (res.ok) {
            console.log('Chat muted: ', chatId);
            dispatch({type: actionTypes.MUTE_CHAT, payload: chatId});
        }
    } catch (error: any) {
        console.error('Mute chat failed: ', error);
    }
};

export const unmuteChat = (chatId: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res = await fetch(`${BASE_API_URL}/${USER_PATH}/chats/${chatId}/mute`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        if (res.ok) {
            console.log('Chat unmuted: ', chatId);
            dispatch({type: actionTypes.UNMUTE_CHAT, payload: chatId});
        }
    } catch (error: any) {
        console.error('Unmute chat failed: ', error);
    }
};
