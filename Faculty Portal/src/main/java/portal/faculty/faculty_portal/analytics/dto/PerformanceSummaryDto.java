package portal.faculty.faculty_portal.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PerformanceSummaryDto {
    private Integer totalFaculty;
    private Integer totalTasksAssigned;
    private Integer totalTasksCompleted;
    private Double averagePerformanceScore;
    private List<FacultyPerformanceDto> facultyPerformances;
}
