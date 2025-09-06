package portal.faculty.faculty_portal.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import portal.faculty.faculty_portal.task.TaskRepository;

@Component("guard")
@RequiredArgsConstructor
public class Guard {

    private final TaskRepository tasks;

    /** True only if the current user is the assignedTo (faculty) of this task */
    public boolean isAssignee(Long taskId, Authentication auth) {
        String email = auth.getName();
        return tasks.findById(taskId).map(t ->
                t.getAssignedTo() != null
                        && t.getAssignedTo().getEmail() != null
                        && t.getAssignedTo().getEmail().equalsIgnoreCase(email)
        ).orElse(false);
    }

    /** Convenience: is HOD role present */
    public boolean isHod(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> "HOD".equals(a.getAuthority()));
    }
}
