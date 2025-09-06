package portal.faculty.faculty_portal.auth.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import portal.faculty.faculty_portal.security.JwtService;
import portal.faculty.faculty_portal.user.User; // <-- your domain User
import portal.faculty.faculty_portal.user.Role; // <-- whatever holds HOD/FACULTY

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public TokenResponse login(@RequestBody LoginRequest body) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(body.getEmail(), body.getPassword())
        );
        UserDetails principal = (UserDetails) auth.getPrincipal();
        String token = jwtService.generateToken((User) principal);
        return new TokenResponse(token);
    }

    // NEW: return the current authenticated user
    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal User user) {
        // If your Security config returns a different principal type,
        // you can also do:
        // User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return new MeResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class TokenResponse {
        private final String token;
    }

    public record MeResponse(Long id, String name, String email, String role) {}
}
