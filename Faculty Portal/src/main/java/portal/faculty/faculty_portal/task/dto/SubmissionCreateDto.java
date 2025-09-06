package portal.faculty.faculty_portal.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SubmissionCreateDto(
        @NotBlank String summary,
        @NotNull @Size(min = 0, max = 10) List<@NotBlank String> links
) {}
