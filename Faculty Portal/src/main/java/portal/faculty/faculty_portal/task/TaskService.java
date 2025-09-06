package portal.faculty.faculty_portal.task;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import portal.faculty.faculty_portal.task.dto.ReviewDto;
import portal.faculty.faculty_portal.task.dto.SubmissionCreateDto;
import portal.faculty.faculty_portal.task.dto.TaskView;
import portal.faculty.faculty_portal.task.submission.TaskSubmission;
import portal.faculty.faculty_portal.task.submission.TaskSubmissionRepository;
import portal.faculty.faculty_portal.user.User;

import java.time.Instant;
import java.util.List;

import static portal.faculty.faculty_portal.task.TaskController.sanitizeLinks;
import static portal.faculty.faculty_portal.task.TaskMapper.toView;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository tasks;
    private final TaskSubmissionRepository submissions;

    private void requireNotLocked(Task t) {
        if (Boolean.TRUE.equals(t.isLocked())) {
            throw new IllegalStateException("Task is locked (completed).");
        }
    }

    private void requireStatus(Task t, TaskStatus expected) {
        if (t.getStatus() != expected) {
            throw new IllegalStateException("Invalid state. Expected " + expected + " but was " + t.getStatus());
        }
    }

    private void requireAssignee(Task t, User current) {
        if (t.getAssignedTo() == null || !t.getAssignedTo().getId().equals(current.getId())) {
            throw new AccessDeniedException("Only the assignee can perform this action.");
        }
    }
    private void requireStatusIn(Task t, TaskStatus... allowed) {
        for (TaskStatus s : allowed) if (t.getStatus() == s) return;
        throw new IllegalStateException("Invalid state. Was " + t.getStatus());
    }

    @Transactional
    public Task start(Long taskId, User current) {
        Task t = tasks.findById(taskId).orElseThrow(() -> new IllegalArgumentException("Task not found"));
        requireAssignee(t, current);
        requireNotLocked(t);
        requireStatusIn(t, TaskStatus.PENDING, TaskStatus.OVERDUE);   // ← allow both
        t.setStatus(TaskStatus.IN_PROGRESS);
        return tasks.save(t);
    }

    @Transactional
    public Task submit(Long taskId, User current, SubmissionCreateDto dto) {
        Task t = tasks.findById(taskId).orElseThrow(() -> new IllegalArgumentException("Task not found"));
        requireAssignee(t, current);
        requireNotLocked(t);
        requireStatus(t, TaskStatus.IN_PROGRESS);

        TaskSubmission s = TaskSubmission.builder()
                .task(t)
                .submittedBy(current)
                .summary(dto.summary())
                .links(dto.links())
                .submittedAt(Instant.now())
                .decision(ReviewDecision.PENDING)
                .build();
        submissions.save(s);

        t.setStatus(TaskStatus.SUBMITTED);
        return tasks.save(t);
    }

    @Transactional
    public Task review(Long taskId, User hod, ReviewDto dto) {
        Task t = tasks.findById(taskId).orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (hod.getRole() != portal.faculty.faculty_portal.user.Role.HOD) {
            throw new AccessDeniedException("Only HOD can review.");
        }
        requireStatus(t, TaskStatus.SUBMITTED);

        TaskSubmission s = submissions
                .findTopByTaskIdAndDecisionOrderBySubmittedAtDesc(taskId, ReviewDecision.PENDING)
                .orElseThrow(() -> new IllegalStateException("No pending submission."));

        s.setDecision(dto.decision());
        s.setDecisionNote(dto.note());
        s.setDecidedAt(Instant.now());
        s.setDecidedBy(hod);
        submissions.save(s);

        if (dto.decision() == ReviewDecision.APPROVED) {
            t.setStatus(TaskStatus.COMPLETED);
            t.setLocked(true);
        } else { // REJECTED
            t.setStatus(TaskStatus.PENDING);
            t.setLocked(false);
        }
        return tasks.save(t);
    }

    @Transactional(readOnly = true)
    public List<TaskSubmission> listSubmissions(Long taskId) {
        return submissions.findByTaskIdOrderBySubmittedAtDesc(taskId);
    }
    public TaskView updateTaskLinks(Long taskId, List<String> links) {
        Task task = tasks.findById(taskId).orElseThrow();
        task.setLinks(sanitizeLinks(links));
        return toView(task);
    }

}
