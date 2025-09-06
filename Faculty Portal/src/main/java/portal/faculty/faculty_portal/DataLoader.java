package portal.faculty.faculty_portal;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import portal.faculty.faculty_portal.user.*;



@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Override public void run(String... args) {
        if (users.count() == 4) {
            users.save(User.builder()
                    .name("faculty3")
                    .email("faculty@ftms.local3")
                    .password(encoder.encode("password"))
                    .role(Role.FACULTY)
                    .department("EEE")
                    .enabled(true)
                    .build());
        }
    }
}
