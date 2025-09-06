package portal.faculty.faculty_portal.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import portal.faculty.faculty_portal.analytics.dto.PerformanceSummaryDto;
import portal.faculty.faculty_portal.analytics.dto.TaskTrendDto;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('HOD','ROLE_HOD','ADMIN','ROLE_ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/faculty-performance")
    public ResponseEntity<PerformanceSummaryDto> getFacultyPerformance(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,

            @RequestParam(value = "department", required = false) String department) {

        try {
            PerformanceSummaryDto summary = analyticsService.getFacultyPerformance(startDate, endDate, department);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            // Add logging to debug the issue
            System.err.println("Error in getFacultyPerformance: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/task-trends")
    public ResponseEntity<List<TaskTrendDto>> getTaskTrends(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        try {
            List<TaskTrendDto> trends = analyticsService.getTaskTrends(startDate, endDate);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            System.err.println("Error in getTaskTrends: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
