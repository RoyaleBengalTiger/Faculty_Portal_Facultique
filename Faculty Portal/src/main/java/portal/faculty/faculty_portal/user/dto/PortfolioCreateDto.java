package portal.faculty.faculty_portal.user.dto;

import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import lombok.Data;

@Data
public class PortfolioCreateDto {

    @Size(max = 2048, message = "Bio must not exceed 2048 characters")
    private String bio;

    @URL(message = "Website URL must be valid")
    @Size(max = 1024, message = "Website URL must not exceed 1024 characters")
    private String websiteUrl;

    @URL(message = "LinkedIn URL must be valid")
    @Size(max = 1024, message = "LinkedIn URL must not exceed 1024 characters")
    private String linkedinUrl;

    @URL(message = "GitHub URL must be valid")
    @Size(max = 1024, message = "GitHub URL must not exceed 1024 characters")
    private String githubUrl;

    @URL(message = "Twitter URL must be valid")
    @Size(max = 1024, message = "Twitter URL must not exceed 1024 characters")
    private String twitterUrl;

    @Size(max = 1024, message = "Research interests must not exceed 1024 characters")
    private String researchInterests;

    @Size(max = 2048, message = "Achievements must not exceed 2048 characters")
    private String achievements;

    @Size(max = 2048, message = "Education must not exceed 2048 characters")
    private String education;

    @Size(max = 2048, message = "Experience must not exceed 2048 characters")
    private String experience;
}
