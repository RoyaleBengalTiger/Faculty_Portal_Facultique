package portal.faculty.faculty_portal.analytics;

import portal.faculty.faculty_portal.analytics.dto.PerformanceSummaryDto;
import portal.faculty.faculty_portal.analytics.dto.TaskTrendDto;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsService {
    PerformanceSummaryDto getFacultyPerformance(LocalDate startDate, LocalDate endDate, String department);
    List<TaskTrendDto> getTaskTrends(LocalDate startDate, LocalDate endDate);
}
