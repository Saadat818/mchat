import {MessageDTO, SendMessageRequestDTO} from "./MessageModel";
import {AppDispatch} from "../Store";
import {BASE_API_URL} from "../../config/Config";
import {AUTHORIZATION_PREFIX} from "../Constants";
import * as actionTypes from './MessageActionType';
import {UUID} from "node:crypto";

const MESSAGE_PATH = 'api/messages';

export const createMessage = (data: SendMessageRequestDTO, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
            body: JSON.stringify(data),
        });

        const resData: MessageDTO = await res.json();
        console.log('Send message: ', resData);
        dispatch({type: actionTypes.CREATE_NEW_MESSAGE, payload: resData});
    } catch (error: any) {
        console.error('Sending message failed', error);
    }
};

export const getAllMessages = (chatId: UUID, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/chat/${chatId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            }
        });

        const resData: MessageDTO[] = await res.json();
        console.log('Getting messages: ', resData);
        dispatch({type: actionTypes.GET_ALL_MESSAGES, payload: resData});
    } catch (error: any) {
        console.error('Getting messages failed: ', error);
    }
};

// Редактирование сообщения
export const editMessage = (messageId: UUID, content: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/${messageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
            body: JSON.stringify({ content }),
        });

        const resData: MessageDTO = await res.json();
        console.log('Edit message: ', resData);
        dispatch({type: actionTypes.EDIT_MESSAGE, payload: resData});
    } catch (error: any) {
        console.error('Editing message failed', error);
    }
};

// Удаление "у меня"
export const deleteMessageForMe = (messageId: UUID, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/${messageId}/delete-for-me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        console.log('Delete message for me: ', messageId);
        dispatch({type: actionTypes.DELETE_MESSAGE_FOR_ME, payload: messageId});
    } catch (error: any) {
        console.error('Deleting message for me failed', error);
    }
};

// Удаление "у всех"
export const deleteMessageForAll = (messageId: UUID, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/${messageId}/delete-for-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        const resData: MessageDTO = await res.json();
        console.log('Delete message for all: ', resData);
        dispatch({type: actionTypes.DELETE_MESSAGE_FOR_ALL, payload: resData});
    } catch (error: any) {
        console.error('Deleting message for all failed', error);
    }
};

// Пересылка сообщения
export const forwardMessage = (messageId: UUID, targetChatIds: UUID[], token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/forward`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
            body: JSON.stringify({ messageId, targetChatIds }),
        });

        const resData: MessageDTO[] = await res.json();
        console.log('Forward message: ', resData);
        dispatch({type: actionTypes.FORWARD_MESSAGE, payload: resData});
    } catch (error: any) {
        console.error('Forwarding message failed', error);
    }
};

// Загрузка файлов
export const uploadFiles = (chatId: UUID, files: FileList, content: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('chatId', chatId.toString());
        formData.append('content', content);

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const res: Response = await fetch(`${BASE_API_URL}/api/files/upload`, {
            method: 'POST',
            headers: {
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
            body: formData,
        });

        const resData: MessageDTO = await res.json();
        console.log('Upload files: ', resData);
        dispatch({type: actionTypes.UPLOAD_FILES, payload: resData});
    } catch (error: any) {
        console.error('Uploading files failed', error);
    }
};

// Поиск сообщений в чате
export const searchMessages = (chatId: UUID, query: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/chat/${chatId}/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        const resData: MessageDTO[] = await res.json();
        console.log('Search messages: ', resData);
        dispatch({type: actionTypes.SEARCH_MESSAGES, payload: resData});
    } catch (error: any) {
        console.error('Searching messages failed', error);
    }
};

// Очистка результатов поиска
export const clearSearchResults = () => (dispatch: AppDispatch): void => {
    dispatch({type: actionTypes.CLEAR_SEARCH_RESULTS});
};

// Добавить реакцию на сообщение
export const addReaction = (messageId: UUID, emoji: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        const resData: MessageDTO = await res.json();
        console.log('Add reaction: ', resData);
        dispatch({type: actionTypes.ADD_REACTION, payload: resData});
    } catch (error: any) {
        console.error('Adding reaction failed', error);
    }
};

// Удалить реакцию с сообщения
export const removeReaction = (messageId: UUID, emoji: string, token: string) => async (dispatch: AppDispatch): Promise<void> => {
    try {
        const res: Response = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${AUTHORIZATION_PREFIX}${token}`,
            },
        });

        const resData: MessageDTO = await res.json();
        console.log('Remove reaction: ', resData);
        dispatch({type: actionTypes.REMOVE_REACTION, payload: resData});
    } catch (error: any) {
        console.error('Removing reaction failed', error);
    }
};