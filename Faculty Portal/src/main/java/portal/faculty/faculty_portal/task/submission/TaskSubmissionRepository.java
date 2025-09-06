package portal.faculty.faculty_portal.task.submission;

import org.springframework.data.jpa.repository.JpaRepository;
import portal.faculty.faculty_portal.task.ReviewDecision;

import java.util.List;
import java.util.Optional;

public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {

    Optional<TaskSubmission> findTopByTaskIdAndDecisionOrderBySubmittedAtDesc(Long taskId, ReviewDecision decision);

    List<TaskSubmission> findByTaskIdOrderBySubmittedAtDesc(Long taskId);
}
