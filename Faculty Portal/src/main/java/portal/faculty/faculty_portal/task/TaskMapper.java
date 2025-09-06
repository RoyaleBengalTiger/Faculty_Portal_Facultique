package portal.faculty.faculty_portal.task;

import portal.faculty.faculty_portal.task.dto.TaskView;
import portal.faculty.faculty_portal.user.User;
import portal.faculty.faculty_portal.task.dto.SubmissionView;
import portal.faculty.faculty_portal.task.submission.TaskSubmission;

import java.util.List;

public final class TaskMapper {
    private TaskMapper() {}

    public static TaskView toView(Task t) {
        return TaskView.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .dueAt(t.getDueAt())
                .status(t.getStatus().name())
                .priority(t.getPriority())
                .assignedTo(toMini(t.getAssignedTo()))
                .assignedBy(toMini(t.getAssignedBy()))
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .locked(t.isLocked())
                // NEW: include task-level links (empty list if null)
                .links(safeList(t.getLinks()))
                .build();
    }

    private static TaskView.MiniUser toMini(User u) {
        if (u == null) {
            return null;
        }
        return TaskView.MiniUser.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .department(u.getDepartment())
                .build();
    }

    public static SubmissionView toView(TaskSubmission s) {
        return SubmissionView.builder()
                .id(s.getId())
                .taskId(s.getTask().getId())
                .submittedBy(toMini(s.getSubmittedBy()))
                .summary(s.getSummary())
                .links(s.getLinks())
                .submittedAt(s.getSubmittedAt())
                .decision(s.getDecision())
                .decisionNote(s.getDecisionNote())
                .decidedAt(s.getDecidedAt())
                .decidedBy(toMini(s.getDecidedBy()))
                .build();
    }

    // --- helpers ---
    private static <T> List<T> safeList(List<T> in) {
        return (in == null) ? List.of() : in;
    }
}
