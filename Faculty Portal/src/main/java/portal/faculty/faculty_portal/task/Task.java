package portal.faculty.faculty_portal.task;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import portal.faculty.faculty_portal.user.User;
import java.util.ArrayList;
import java.util.List;

import java.time.Instant;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity @Table(name = "tasks")
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    private Instant dueAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(nullable = false)
    private boolean locked = false;

    private Integer priority; // 1 (high) .. 5 (low)

    @ManyToOne(optional=false) @JoinColumn(name="assigned_to_id")
    private User assignedTo;

    @ManyToOne(optional=false) @JoinColumn(name="assigned_by_id")
    private User assignedBy;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @ElementCollection()
    @CollectionTable(name = "task_links", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "url", length = 2048, nullable = false)
    private List<String> links = new ArrayList<>();

    public boolean isLocked() {
        return this.status == TaskStatus.COMPLETED ;
    }

}
