package portal.faculty.faculty_portal.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class FacultyPerformanceDto {
    private Long facultyId;
    private String facultyName;
    private String facultyEmail;
    private String department;
    private Long tasksAssigned;
    private Long tasksCompleted;
    private Long tasksInProgress;
    private Long tasksOverdue;
    private Double averageCompletionTime; // in days
    private Double performanceScore; // percentage
    private LocalDate lastActiveDate;
}
