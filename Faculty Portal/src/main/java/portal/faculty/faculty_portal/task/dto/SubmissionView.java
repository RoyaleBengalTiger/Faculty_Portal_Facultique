package portal.faculty.faculty_portal.task.dto;

import lombok.Builder;
import lombok.Value;
import portal.faculty.faculty_portal.task.ReviewDecision;

import java.time.Instant;
import java.util.List;

@Value
@Builder
public class SubmissionView {
    Long id;
    Long taskId;

    TaskView.MiniUser submittedBy;   // who submitted
    String summary;
    List<String> links;
    Instant submittedAt;

    ReviewDecision decision;         // PENDING / APPROVED / REJECTED
    String decisionNote;
    Instant decidedAt;
    TaskView.MiniUser decidedBy;     // HOD who decided
}
