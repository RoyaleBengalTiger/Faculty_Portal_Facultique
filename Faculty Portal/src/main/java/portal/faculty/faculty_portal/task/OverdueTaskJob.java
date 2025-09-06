package portal.faculty.faculty_portal.task;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OverdueTaskJob {

    private final TaskRepository tasks;

    // run every 5 minutes
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void markOverdue() {
        List<Task> candidates = tasks.findByDueAtBeforeAndStatusNot(Instant.now(), TaskStatus.COMPLETED);
        for (Task t : candidates) {
            if (t.getStatus() != TaskStatus.SUBMITTED && t.getStatus() != TaskStatus.COMPLETED) {
                t.setStatus(TaskStatus.OVERDUE);
                tasks.save(t);
            }
        }
    }
}
