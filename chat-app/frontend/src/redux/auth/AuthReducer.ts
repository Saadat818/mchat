import {AuthReducerState} from "./AuthModel";
import * as actionTypes from './AuthActionType';
import {Action} from "../CommonModel";

const initialState: AuthReducerState = {
    signin: null,
    signup: null,
    reqUser: null,
    searchUser: null,
    updateUser: null,
    loading: false,
    error: null,
};

const authReducer = (state: AuthReducerState = initialState, action: Action): AuthReducerState => {
    switch (action.type) {
        case actionTypes.AUTH_LOADING:
            return {...state, loading: action.payload, error: null};
        case actionTypes.AUTH_ERROR:
            return {...state, loading: false, error: action.payload};
        case actionTypes.CLEAR_AUTH_ERROR:
            return {...state, error: null};
        case actionTypes.REGISTER:
            return {...state, signup: action.payload, loading: false, error: null};
        case actionTypes.LOGIN_USER:
            return {...state, signin: action.payload, loading: false, error: null};
        case actionTypes.REQ_USER:
            return {...state, reqUser: action.payload};
        case actionTypes.SEARCH_USER:
            return {...state, searchUser: action.payload};
        case actionTypes.UPDATE_USER:
            return {...state, updateUser: action.payload};
        case actionTypes.LOGOUT_USER:
            return {...state, signin: null, signup: null, reqUser: null, loading: false, error: null};
        case actionTypes.PIN_CHAT:
            if (state.reqUser) {
                const pinnedChatIds = state.reqUser.pinnedChatIds || [];
                return {
                    ...state,
                    reqUser: {
                        ...state.reqUser,
                        pinnedChatIds: [...pinnedChatIds, action.payload]
                    }
                };
            }
            return state;
        case actionTypes.UNPIN_CHAT:
            if (state.reqUser && state.reqUser.pinnedChatIds) {
                return {
                    ...state,
                    reqUser: {
                        ...state.reqUser,
                        pinnedChatIds: state.reqUser.pinnedChatIds.filter(id => id !== action.payload)
                    }
                };
            }
            return state;
        case actionTypes.MUTE_CHAT:
            if (state.reqUser) {
                const mutedChatIds = state.reqUser.mutedChatIds || [];
                return {
                    ...state,
                    reqUser: {
                        ...state.reqUser,
                        mutedChatIds: [...mutedChatIds, action.payload]
                    }
                };
            }
            return state;
        case actionTypes.UNMUTE_CHAT:
            if (state.reqUser && state.reqUser.mutedChatIds) {
                return {
                    ...state,
                    reqUser: {
                        ...state.reqUser,
                        mutedChatIds: state.reqUser.mutedChatIds.filter(id => id !== action.payload)
                    }
                };
            }
            return state;
    }
    return state;
};

export default authReducer;