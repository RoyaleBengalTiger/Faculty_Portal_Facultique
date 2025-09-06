package portal.faculty.faculty_portal.task.dto;

import jakarta.validation.constraints.NotNull;
import portal.faculty.faculty_portal.task.ReviewDecision;

public record ReviewDto(
        @NotNull ReviewDecision decision, // APPROVED or REJECTED
        String note
) {}
