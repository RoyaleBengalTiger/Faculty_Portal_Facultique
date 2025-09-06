package portal.faculty.faculty_portal.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_portfolios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPortfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 2048)
    private String bio;

    @Column(length = 1024)
    private String websiteUrl;

    @Column(length = 1024)
    private String linkedinUrl;

    @Column(length = 1024)
    private String githubUrl;

    @Column(length = 1024)
    private String twitterUrl;

    @Column(length = 1024)
    private String researchInterests;

    @Column(length = 2048)
    private String achievements;

    @Column(length = 2048)
    private String education;

    @Column(length = 2048)
    private String experience;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
