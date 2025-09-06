package portal.faculty.faculty_portal.task.submission;

import jakarta.persistence.*;
import lombok.*;
import portal.faculty.faculty_portal.task.ReviewDecision;
import portal.faculty.faculty_portal.task.Task;
import portal.faculty.faculty_portal.user.User;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "task_submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskSubmission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id")
    private User submittedBy;

    @Column(columnDefinition = "text", nullable = false)
    private String summary;

    @ElementCollection
    @CollectionTable(name = "task_submission_links", joinColumns = @JoinColumn(name = "submission_id"))
    @Column(name = "url", nullable = false)
    private List<String> links = new ArrayList<>();

    @Column(nullable = false)
    private Instant submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ReviewDecision decision;

    private Instant decidedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_id")
    private User decidedBy;

    @Column(columnDefinition = "text")
    private String decisionNote;
}
