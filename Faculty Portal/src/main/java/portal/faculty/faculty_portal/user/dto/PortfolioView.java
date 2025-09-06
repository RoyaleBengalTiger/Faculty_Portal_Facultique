package portal.faculty.faculty_portal.user.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class PortfolioView {
    Long id;
    Long userId;
    String userName;
    String userEmail;
    String userRole;
    String userDepartment;
    String bio;
    String websiteUrl;
    String linkedinUrl;
    String githubUrl;
    String twitterUrl;
    String researchInterests;
    String achievements;
    String education;
    String experience;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
