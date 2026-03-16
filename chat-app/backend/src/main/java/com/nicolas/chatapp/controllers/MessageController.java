package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.config.JwtConstants;
import com.nicolas.chatapp.dto.request.EditMessageRequestDTO;
import com.nicolas.chatapp.dto.request.ForwardMessageRequestDTO;
import com.nicolas.chatapp.dto.request.SendMessageRequestDTO;
import com.nicolas.chatapp.dto.response.ApiResponseDTO;
import com.nicolas.chatapp.dto.response.MessageDTO;
import com.nicolas.chatapp.exception.ChatException;
import com.nicolas.chatapp.exception.MessageException;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.Message;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.service.MessageService;
import com.nicolas.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    private final UserService userService;
    private final MessageService messageService;

    @PostMapping("/create")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageRequestDTO req,
                                                  @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws ChatException, UserException {

        User user = userService.findUserByProfile(jwt);
        Message message = messageService.sendMessage(req, user.getId());
        log.info("User {} sent message: {}", user.getEmail(), message.getId());

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDTO>> getChatMessages(@PathVariable UUID chatId,
                                                         @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws ChatException, UserException {

        User user = userService.findUserByProfile(jwt);
        List<Message> messages = messageService.getChatMessages(chatId, user);

        return new ResponseEntity<>(MessageDTO.fromMessages(messages), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deleteMessage(@PathVariable UUID id,
                                                        @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        messageService.deleteMessageById(id, user);
        log.info("User {} deleted message: {}", user.getEmail(), id);

        ApiResponseDTO res = ApiResponseDTO.builder()
                .message("Message deleted successfully")
                .status(true)
                .build();

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // Редактирование сообщения (только автор, в течение 24 часов)
    @PutMapping("/{id}")
    public ResponseEntity<MessageDTO> editMessage(@PathVariable UUID id,
                                                  @RequestBody EditMessageRequestDTO req,
                                                  @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        Message message = messageService.editMessage(id, req.getContent(), user);
        log.info("User {} edited message: {}", user.getEmail(), id);

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    // Удаление "у меня" - сообщение скрывается только для текущего пользователя
    @PostMapping("/{id}/delete-for-me")
    public ResponseEntity<ApiResponseDTO> deleteMessageForMe(@PathVariable UUID id,
                                                             @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        messageService.deleteMessageForMe(id, user);
        log.info("User {} deleted message for self: {}", user.getEmail(), id);

        ApiResponseDTO res = ApiResponseDTO.builder()
                .message("Message deleted for you")
                .status(true)
                .build();

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // Удаление "у всех" - soft delete, видно всем как "Сообщение удалено"
    @PostMapping("/{id}/delete-for-all")
    public ResponseEntity<MessageDTO> deleteMessageForAll(@PathVariable UUID id,
                                                          @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        messageService.deleteMessageForAll(id, user);
        Message message = messageService.findMessageById(id);
        log.info("User {} deleted message for all: {}", user.getEmail(), id);

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    // Пересылка сообщения в другие чаты
    @PostMapping("/forward")
    public ResponseEntity<List<MessageDTO>> forwardMessage(@RequestBody ForwardMessageRequestDTO req,
                                                           @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException, ChatException {

        User user = userService.findUserByProfile(jwt);
        List<Message> messages = messageService.forwardMessage(req.messageId(), req.targetChatIds(), user);
        log.info("User {} forwarded message {} to {} chats", user.getEmail(), req.messageId(), req.targetChatIds().size());

        return new ResponseEntity<>(MessageDTO.fromMessages(messages), HttpStatus.OK);
    }

    // Поиск сообщений в чате
    @GetMapping("/chat/{chatId}/search")
    public ResponseEntity<List<MessageDTO>> searchMessages(@PathVariable UUID chatId,
                                                           @RequestParam String query,
                                                           @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, ChatException {

        User user = userService.findUserByProfile(jwt);
        List<Message> messages = messageService.searchMessages(chatId, query, user);
        log.info("User {} searched messages in chat {} with query: {}", user.getEmail(), chatId, query);

        return new ResponseEntity<>(MessageDTO.fromMessages(messages), HttpStatus.OK);
    }

    // Добавить реакцию на сообщение
    @PostMapping("/{id}/reactions")
    public ResponseEntity<MessageDTO> addReaction(@PathVariable UUID id,
                                                   @RequestParam String emoji,
                                                   @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        Message message = messageService.addReaction(id, emoji, user);
        log.info("User {} added reaction {} to message {}", user.getEmail(), emoji, id);

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    // Удалить реакцию с сообщения
    @DeleteMapping("/{id}/reactions")
    public ResponseEntity<MessageDTO> removeReaction(@PathVariable UUID id,
                                                      @RequestParam String emoji,
                                                      @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, MessageException {

        User user = userService.findUserByProfile(jwt);
        Message message = messageService.removeReaction(id, emoji, user);
        log.info("User {} removed reaction {} from message {}", user.getEmail(), emoji, id);

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

}
