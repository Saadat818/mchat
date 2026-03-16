package com.nicolas.chatapp.controllers;

import com.nicolas.chatapp.config.JwtConstants;
import com.nicolas.chatapp.dto.response.AttachmentDTO;
import com.nicolas.chatapp.dto.response.MessageDTO;
import com.nicolas.chatapp.exception.ChatException;
import com.nicolas.chatapp.exception.MessageException;
import com.nicolas.chatapp.exception.UserException;
import com.nicolas.chatapp.model.Attachment;
import com.nicolas.chatapp.model.Chat;
import com.nicolas.chatapp.model.Message;
import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.AttachmentRepository;
import com.nicolas.chatapp.repository.MessageRepository;
import com.nicolas.chatapp.service.ChatService;
import com.nicolas.chatapp.service.FileStorageService;
import com.nicolas.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;
    private final AttachmentRepository attachmentRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final ChatService chatService;

    // Загрузка файлов и создание сообщения с вложениями
    @PostMapping("/upload")
    public ResponseEntity<MessageDTO> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("chatId") UUID chatId,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestHeader(JwtConstants.TOKEN_HEADER) String jwt)
            throws UserException, ChatException {

        User user = userService.findUserByProfile(jwt);
        Chat chat = chatService.findChatById(chatId);

        // Создаём сообщение
        Message message = Message.builder()
                .chat(chat)
                .user(user)
                .content(content)
                .timeStamp(LocalDateTime.now())
                .readBy(new HashSet<>(Set.of(user.getId())))
                .attachments(new HashSet<>())
                .build();

        message = messageRepository.save(message);
        chat.getMessages().add(message);

        // Сохраняем файлы и создаём attachments
        for (MultipartFile file : files) {
            String storedName = fileStorageService.storeFile(file);

            Attachment attachment = Attachment.builder()
                    .fileName(file.getOriginalFilename())
                    .storedName(storedName)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .message(message)
                    .build();

            attachmentRepository.save(attachment);
            message.getAttachments().add(attachment);
        }

        log.info("User {} uploaded {} files to chat {}", user.getEmail(), files.length, chatId);

        return new ResponseEntity<>(MessageDTO.fromMessage(message), HttpStatus.OK);
    }

    // Скачивание файла
    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        Optional<Attachment> attachment = attachmentRepository.findByStoredName(fileName);
        String contentType = attachment.map(Attachment::getContentType).orElse("application/octet-stream");
        String originalFileName = attachment.map(Attachment::getFileName).orElse(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + originalFileName + "\"")
                .body(resource);
    }
}
