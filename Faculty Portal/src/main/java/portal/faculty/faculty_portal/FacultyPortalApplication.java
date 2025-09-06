package portal.faculty.faculty_portal;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableScheduling
@SpringBootApplication
public class FacultyPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(FacultyPortalApplication.class, args);
    }

}
