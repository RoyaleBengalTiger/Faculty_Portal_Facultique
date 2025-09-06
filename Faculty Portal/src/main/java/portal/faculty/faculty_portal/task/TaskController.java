package portal.faculty.faculty_portal.task;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import portal.faculty.faculty_portal.task.dto.*;
import portal.faculty.faculty_portal.user.Role;
import portal.faculty.faculty_portal.user.User;
import portal.faculty.faculty_portal.user.UserRepository;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static portal.faculty.faculty_portal.task.TaskMapper.toView;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository tasks;
    private final UserRepository users;
    private final TaskService service;

    /** List tasks for the current user (FACULTY) or all (HOD). */
    @GetMapping
    public List<TaskView> listForCurrent(Authentication auth,
                                         @RequestParam(required = false) String status) {
        User requester = (User) auth.getPrincipal();
        boolean isHod = requester.getRole() == Role.HOD;

        TaskStatus filter = null;
        if (status != null && !status.isBlank()) {
            try {
                filter = TaskStatus.valueOf(status);
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid status: " + status);
            }
        }

        List<Task> result;
        if (isHod) {
            result = (filter == null) ? tasks.findAll() : tasks.findByStatus(filter);
        } else {
            result = (filter == null)
                    ? tasks.findByAssignedTo(requester)
                    : tasks.findByAssignedToAndStatus(requester, filter);
        }
        return result.stream().map(TaskMapper::toView).toList();
    }

    /** HOD creates/assigns a task. assignedBy = current authenticated user */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('HOD','ROLE_HOD')")
    public TaskView create(@Valid @RequestBody TaskCreateDto dto, Authentication auth) {
        User assigner = (User) auth.getPrincipal();
        User assignee = users.findById(dto.getAssignedToUserId())
                .orElseThrow(() -> new IllegalArgumentException("Assignee not found"));

        Task t = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueAt(dto.getDueAt())
                .priority(dto.getPriority() == null ? 3 : dto.getPriority())
                .status(TaskStatus.PENDING) // default to PENDING
                .assignedTo(assignee)
                .assignedBy(assigner)
                // NEW: persist task-level links (empty list if null/blank entries)
                .links(sanitizeLinks(dto.getLinks()))
                .build();

        return toView(tasks.save(t));
    }

    // --- helper ---
    static List<String> sanitizeLinks(List<String> links) {
        if (links == null) return List.of();
        return links.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/links")
    @PreAuthorize("hasAnyAuthority('HOD','ROLE_HOD')")
    public TaskView replaceLinks(
            @PathVariable Long id,
            @RequestBody @Size(max = 50)
            List<
                    @Size(max = 2048)
                    @Pattern(regexp = "^(https?://).*$") String
                    > links) {
        return service.updateTaskLinks(id, links);
    }



    /** List tasks for a specific userId. */
    @GetMapping("/by-user/{userId}")
    public List<TaskView> listByUser(@PathVariable Long userId,
                                     Authentication auth,
                                     @RequestParam(required = false) String status) {
        User requester = (User) auth.getPrincipal();
        boolean isHod = requester.getRole() == Role.HOD;

        if (!isHod && !requester.getId().equals(userId)) {
            throw new AccessDeniedException("You can only view your own tasks");
        }

        User target = users.findById(userId).orElseThrow();
        List<Task> result;
        if (status == null || status.isBlank()) {
            result = tasks.findByAssignedTo(target);
        } else {
            TaskStatus st = TaskStatus.valueOf(status);
            result = tasks.findByAssignedToAndStatus(target, st);
        }

        return result.stream().map(TaskMapper::toView).toList();
    }

    /** Fetch a single task by id (auth required) */
    @GetMapping("/{taskId}")
    public TaskView getOne(@PathVariable Long taskId, Authentication auth) {
        User requester = (User) auth.getPrincipal();
        Task t = tasks.findById(taskId).orElseThrow();

        boolean isHod = requester.getRole() == Role.HOD;
        boolean isAssignee = t.getAssignedTo().getId().equals(requester.getId());
        boolean isAssigner = t.getAssignedBy() != null && t.getAssignedBy().getId().equals(requester.getId());

        if (!isHod && !isAssignee && !isAssigner) {
            throw new AccessDeniedException("Not allowed to view this task");
        }

        return toView(t);
    }

    @PutMapping("/{id}/status")
    public Task updateStatus(@PathVariable Long id, @RequestBody TaskUpdateStatusDto body, Authentication authentication) {
        Task t = tasks.findById(id).orElseThrow(() -> new IllegalArgumentException("Task not found"));

        requireAssignee(t, authentication);  // Added method
        requireNotLocked(t);  // Added method

        if (t.isLocked()) throw new IllegalStateException("Task is locked.");

        TaskStatus newSt = TaskStatus.valueOf(body.getStatus());
        boolean isHod = authentication.getAuthorities().stream().anyMatch(a -> "ROLE_HOD".equals(a.getAuthority()));
        boolean isAssignee = t.getAssignedTo().getId().equals(((User) authentication.getPrincipal()).getId());

        // faculty: only IN_PROGRESS from PENDING/OVERDUE
        if (!isHod && isAssignee) {
            if (newSt != TaskStatus.IN_PROGRESS) throw new AccessDeniedException("Invalid status change");
            if (!(t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.OVERDUE))
                throw new IllegalStateException("Invalid transition");
        }

        t.setStatus(newSt);
        return tasks.save(t);
    }

    // Helper method to check if the current user is the assignee
    private void requireAssignee(Task task, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (!task.getAssignedTo().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the assignee for this task.");
        }
    }

    // Helper method to ensure the task is not locked
    private void requireNotLocked(Task task) {
        if (task.isLocked()) {
            throw new IllegalStateException("Task is locked.");
        }
    }

    // -------------------- NEW WORKFLOW --------------------

    /** Faculty: PENDING -> IN_PROGRESS */
    @PatchMapping("/{id}/start")
    @PreAuthorize("hasAnyAuthority('FACULTY','ROLE_FACULTY') and @guard.isAssignee(#id, authentication)")
    public TaskView start(@PathVariable Long id, Authentication auth) {
        User current = users.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toView(service.start(id, current));
    }

    /** Faculty: IN_PROGRESS -> SUBMITTED */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyAuthority('FACULTY','ROLE_FACULTY') and @guard.isAssignee(#id, authentication)")
    public TaskView submit(@PathVariable Long id,
                           @Valid @RequestBody SubmissionCreateDto body,
                           Authentication auth) {
        User current = users.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toView(service.submit(id, current, body));
    }

    /** HOD: review SUBMITTED -> (APPROVED|REJECTED) */
    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyAuthority('HOD','ROLE_HOD')")
    public TaskView review(@PathVariable Long id,
                           @Valid @RequestBody ReviewDto body,
                           Authentication auth) {
        User hod = users.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toView(service.review(id, hod, body));
    }

    /** History (assignee or any HOD) */
    @GetMapping("/{id}/submissions")
    @PreAuthorize("(hasAnyAuthority('FACULTY','ROLE_FACULTY') and @guard.isAssignee(#id, authentication))"
            + " or hasAnyAuthority('HOD','ROLE_HOD')")
    public List<SubmissionView> submissions(@PathVariable Long id) {
        return service.listSubmissions(id).stream()
                .map(TaskMapper::toView)
                .toList();
    }
}
