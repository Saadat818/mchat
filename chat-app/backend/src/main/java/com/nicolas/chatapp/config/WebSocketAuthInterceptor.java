package com.nicolas.chatapp.config;

import com.nicolas.chatapp.model.User;
import com.nicolas.chatapp.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    SecretKey key = Keys.hmacShaKeyFor(JwtConstants.SECRET_KEY.getBytes());
                    Claims claims = Jwts.parser()
                            .verifyWith(key)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();

                    String email = claims.get("email", String.class);

                    if (email != null) {
                        Optional<User> userOpt = userRepository.findByEmail(email);
                        userOpt.ifPresent(user -> {
                            // Сохраняем userId в атрибутах сессии
                            accessor.getSessionAttributes().put("userId", user.getId());
                            accessor.getSessionAttributes().put("userEmail", email);

                            // Обновляем статус онлайн
                            user.setIsOnline(true);
                            user.setLastSeen(LocalDateTime.now());
                            userRepository.save(user);

                            log.info("WebSocket auth: user {} connected", email);
                        });
                    }
                } catch (Exception e) {
                    log.error("WebSocket auth failed: {}", e.getMessage());
                }
            }
        }

        return message;
    }
}
