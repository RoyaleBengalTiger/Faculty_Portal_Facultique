package portal.faculty.faculty_portal.task.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class TaskCreateDto {
    private String title;
    private String description;
    private Instant dueAt;          // e.g., "2025-09-05T18:00:00Z"
    private Long assignedToUserId;  // faculty's user id
    private Integer priority;       // optional (default 3)
    @Size(max = 50, message = "Up to 50 links allowed")
    private List<
                @Size(max = 2048, message = "Each link must be ≤ 2048 characters")
                @Pattern(regexp = "^(https?://).*$", message = "Links must start with http:// or https://")
                        String
                > links;
}
