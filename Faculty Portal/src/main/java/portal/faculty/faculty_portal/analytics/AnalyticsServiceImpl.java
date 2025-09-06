package portal.faculty.faculty_portal.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import portal.faculty.faculty_portal.analytics.dto.FacultyPerformanceDto;
import portal.faculty.faculty_portal.analytics.dto.PerformanceSummaryDto;
import portal.faculty.faculty_portal.analytics.dto.TaskTrendDto;
import portal.faculty.faculty_portal.task.Task;
import portal.faculty.faculty_portal.task.TaskRepository;
import portal.faculty.faculty_portal.task.TaskStatus;
import portal.faculty.faculty_portal.user.Role;
import portal.faculty.faculty_portal.user.User;
import portal.faculty.faculty_portal.user.UserRepository;

import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {
    ZoneId zone = ZoneId.of("Asia/Dhaka");
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional(readOnly = true)
    public PerformanceSummaryDto getFacultyPerformance(LocalDate startDate, LocalDate endDate, String department) {
        // Set default date range if not provided
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        Instant startInstant = startDateTime.atZone(zone).toInstant();
        Instant endInstant = endDateTime.atZone(zone).toInstant();
        Instant currentTime = Instant.now();

        // Debug logging
        System.out.println("🔍 Analytics Query - Start: " + startDate + ", End: " + endDate);

        // Get faculty users
        List<User> facultyUsers = userRepository.findByRole(Role.FACULTY);
        System.out.println("🔍 Found " + facultyUsers.size() + " faculty users");

        // Filter by department if specified
        if (department != null && !department.isEmpty()) {
            facultyUsers = facultyUsers.stream()
                    .filter(user -> department.equals(user.getDepartment()))
                    .toList();
        }
        List<FacultyPerformanceDto> facultyPerformances = new ArrayList<>();
        int totalTasksAssigned = 0;
        int totalTasksCompleted = 0;
        double totalPerformanceScore = 0;

        for (User faculty : facultyUsers) {
            System.out.println("🔍 Processing faculty: " + faculty.getName() + " (ID: " + faculty.getId() + ")");

            // ✅ FIX: Use direct database counting instead of Java filtering
            Long tasksAssigned = taskRepository.countTasksAssignedToUserInPeriod(faculty.getId(), startInstant, endInstant);
            Long tasksCompleted = taskRepository.countTasksByUserAndStatusInPeriod(faculty.getId(), TaskStatus.COMPLETED, startInstant, endInstant);
            Long tasksInProgress = taskRepository.countTasksByUserAndStatusInPeriod(faculty.getId(), TaskStatus.IN_PROGRESS, startInstant, endInstant);
            Long tasksOverdue = taskRepository.countOverdueTasksByUserInPeriod(faculty.getId(), TaskStatus.COMPLETED, currentTime, startInstant, endInstant);

            // Handle null results from queries
            tasksAssigned = tasksAssigned != null ? tasksAssigned : 0L;
            tasksCompleted = tasksCompleted != null ? tasksCompleted : 0L;
            tasksInProgress = tasksInProgress != null ? tasksInProgress : 0L;
            tasksOverdue = tasksOverdue != null ? tasksOverdue : 0L;

            System.out.println("  📊 Tasks - Assigned: " + tasksAssigned + ", Completed: " + tasksCompleted +
                    ", In Progress: " + tasksInProgress + ", Overdue: " + tasksOverdue);

            // Calculate average completion time using direct query
            double avgCompletionTime = calculateAverageCompletionTime(faculty.getId(), startInstant, endInstant);

            // Calculate performance score
            double completionRate = tasksAssigned > 0 ? (double) tasksCompleted / tasksAssigned * 100 : 0;
            double timelinessScore = tasksOverdue == 0 ? 100 : Math.max(0, 100 - (tasksOverdue * 10));
            double performanceScore = (completionRate + timelinessScore) / 2;

            // Get last active date (simplified)
            LocalDate lastActiveDate = faculty.getCreatedAt().toLocalDate();

            FacultyPerformanceDto facultyPerformance = FacultyPerformanceDto.builder()
                    .facultyId(faculty.getId())
                    .facultyName(faculty.getName())
                    .facultyEmail(faculty.getEmail())
                    .department(faculty.getDepartment())
                    .tasksAssigned(tasksAssigned)
                    .tasksCompleted(tasksCompleted)
                    .tasksInProgress(tasksInProgress)
                    .tasksOverdue(tasksOverdue)
                    .averageCompletionTime(avgCompletionTime)
                    .performanceScore(performanceScore)
                    .lastActiveDate(lastActiveDate)
                    .build();

            facultyPerformances.add(facultyPerformance);

            totalTasksAssigned += tasksAssigned.intValue();
            totalTasksCompleted += tasksCompleted.intValue();
            totalPerformanceScore += performanceScore;
        }

        double averagePerformanceScore = !facultyUsers.isEmpty() ? totalPerformanceScore / facultyUsers.size() : 0;

        System.out.println("🔍 Final totals - Assigned: " + totalTasksAssigned + ", Completed: " + totalTasksCompleted);

        return PerformanceSummaryDto.builder()
                .totalFaculty(facultyUsers.size())
                .totalTasksAssigned(totalTasksAssigned)
                .totalTasksCompleted(totalTasksCompleted)
                .averagePerformanceScore(averagePerformanceScore)
                .facultyPerformances(facultyPerformances)
                .build();
    }

    private double calculateAverageCompletionTime(Long userId, Instant startDate, Instant endDate) {
        List<Object[]> completionTimes = taskRepository.findCompletionTimesByUserInPeriod(userId, startDate, endDate);

        if (completionTimes.isEmpty()) {
            return 0.0;
        }

        return completionTimes.stream()
                .mapToDouble(row -> {
                    Instant createdAt = (Instant) row[0];
                    Instant updatedAt = (Instant) row[1];
                    return ChronoUnit.DAYS.between(createdAt, updatedAt);
                })
                .average()
                .orElse(0.0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskTrendDto> getTaskTrends(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        Instant startInstant = startDateTime.atZone(zone).toInstant();
        Instant endInstant = endDateTime.atZone(zone).toInstant();

        // Get tasks with basic info for trend analysis
        List<Task> tasks = taskRepository.findByCreatedAtBetween(startInstant, endInstant);

        Map<String, TaskTrendDto> trendsMap = new LinkedHashMap<>();

        for (Task task : tasks) {
            LocalDateTime createdAt = task.getCreatedAt().atZone(zone).toLocalDateTime();
            String monthKey = createdAt.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) +
                    " " + createdAt.getYear();

            TaskTrendDto trend = trendsMap.computeIfAbsent(monthKey, k -> TaskTrendDto.builder()
                    .month(k)
                    .assigned(0)
                    .completed(0)
                    .overdue(0)
                    .build());

            trend.setAssigned(trend.getAssigned() + 1);

            if (task.getStatus() == TaskStatus.COMPLETED) {
                trend.setCompleted(trend.getCompleted() + 1);
            }

            LocalDateTime dueAt = task.getDueAt().atZone(zone).toLocalDateTime();
            if (dueAt.isBefore(LocalDateTime.now()) && task.getStatus() != TaskStatus.COMPLETED) {
                trend.setOverdue(trend.getOverdue() + 1);
            }
        }

        return new ArrayList<>(trendsMap.values());
    }
}
