package todo_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import todo_api.dto.LoginRequest;
import todo_api.dto.RegisterRequest;
import todo_api.entity.User;
import todo_api.repository.UserRepository;
import todo_api.security.JwtUtil;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Register User
    public String register(RegisterRequest request) {

        // Check email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {

            throw new RuntimeException("Email already exists");
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(request.getPassword())
                )
                .build();

        userRepository.save(user);

        // Generate token
        return jwtUtil.generateToken(user.getEmail());
    }

    // Login User
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(
                        () -> new RuntimeException("Invalid email or password")
                );

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT token
        return jwtUtil.generateToken(user.getEmail());
    }
}