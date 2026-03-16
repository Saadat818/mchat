package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.dto.request.ReadReceiptDTO;
import com.nicolas.chatapp.dto.request.TypingEventDTO;
import com.nicolas.chatapp.exception.ChatException;
import com.nicolas.chatapp.model.Chat;
import com.nicolas.chatapp.model.Message;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class RealtimeChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/messages")
    public void receiveMessage(@Payload Message message) {
        log.info("Received message via WebSocket: {}", message);
        if (message.getChat() == null || message.getChat().getId() == null) {
            log.error("Message chat is null!");
            return;
        }
        try {
            // Загружаем чат из базы данных чтобы получить полный список пользователей
            Chat chat = chatService.findChatById(message.getChat().getId());
            log.info("Found chat with {} users for message delivery", chat.getUsers().size());

            for (User user : chat.getUsers()) {
                final String destination = "/topic/" + user.getId();
                log.info("Sending message to destination: {}", destination);
                messagingTemplate.convertAndSend(destination, message);
            }
        } catch (ChatException e) {
            log.error("Chat not found for message: {}", message.getChat().getId());
        }
    }

    @MessageMapping("/typing")
    public void receiveTypingEvent(@Payload TypingEventDTO typingEvent) {
        log.info("Received typing event: chatId={}, userId={}, isTyping={}",
                typingEvent.getChatId(), typingEvent.getUserId(), typingEvent.isTyping());
        try {
            UUID chatId = UUID.fromString(typingEvent.getChatId());
            UUID senderId = UUID.fromString(typingEvent.getUserId());

            Chat chat = chatService.findChatById(chatId);
            log.info("Found chat with {} users", chat.getUsers().size());
            // Отправляем typing событие всем пользователям чата, кроме отправителя
            for (User user : chat.getUsers()) {
                if (!user.getId().equals(senderId)) {
                    final String destination = "/topic/" + user.getId();
                    log.info("Sending typing event to: {}", destination);
                    messagingTemplate.convertAndSend(destination, typingEvent);
                }
            }
        } catch (ChatException e) {
            log.warn("Chat not found for typing event: {}", typingEvent.getChatId());
        } catch (Exception e) {
            log.error("Error processing typing event: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/read")
    public void receiveReadReceipt(@Payload ReadReceiptDTO readReceipt) {
        try {
            UUID chatId = UUID.fromString(readReceipt.getChatId());
            UUID readerId = UUID.fromString(readReceipt.getReaderId());

            Chat chat = chatService.findChatById(chatId);
            // Отправляем событие прочтения всем пользователям чата, кроме читателя
            for (User user : chat.getUsers()) {
                if (!user.getId().equals(readerId)) {
                    final String destination = "/topic/" + user.getId();
                    messagingTemplate.convertAndSend(destination, readReceipt);
                }
            }
            log.debug("Read receipt sent for chat {} by user {}", chatId, readerId);
        } catch (ChatException e) {
            log.warn("Chat not found for read receipt: {}", readReceipt.getChatId());
        } catch (Exception e) {
            log.error("Error processing read receipt: {}", e.getMessage());
        }
    }

}
