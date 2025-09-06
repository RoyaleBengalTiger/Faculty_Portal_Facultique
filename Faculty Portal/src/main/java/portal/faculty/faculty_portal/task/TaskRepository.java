package portal.faculty.faculty_portal.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import portal.faculty.faculty_portal.user.User;

import java.time.Instant;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // ---------- Existing simple finders ----------
    List<Task> findByAssignedTo(User user);
    List<Task> findByAssignedToAndStatus(User user, TaskStatus status);
    List<Task> findByDueAtBeforeAndStatusNot(Instant cutoff, TaskStatus status);
    List<Task> findByStatus(TaskStatus status);

    // ✅ Used by getTaskTrends()
    List<Task> findByCreatedAtBetween(Instant startDate, Instant endDate);

    // ---------- Methods required by AnalyticsServiceImpl ----------

    // ✅ Matches: taskRepository.countTasksAssignedToUserInPeriod(...)
    @Query("""
      SELECT COUNT(t)
      FROM Task t
      WHERE t.assignedTo.id = :userId
        AND t.createdAt >= :startInclusive
        AND t.createdAt <  :endExclusive
    """)
    Long countTasksAssignedToUserInPeriod(@Param("userId") Long userId,
                                          @Param("startInclusive") Instant startDate,
                                          @Param("endExclusive") Instant endDate);

    // ✅ Matches: taskRepository.countTasksByUserAndStatusInPeriod(...)
    @Query("""
           SELECT COUNT(t)
           FROM Task t
           WHERE t.assignedTo.id = :userId
             AND t.status = :status
                  AND t.createdAt >= :startInclusive
             AND t.createdAt <  :endExclusive
           """)
    Long countTasksByUserAndStatusInPeriod(@Param("userId") Long userId,
                                           @Param("status") TaskStatus status,
                                           @Param("startInclusive") Instant startDate,
                                           @Param("endExclusive") Instant endDate);

    // ✅ Matches: taskRepository.countOverdueTasksByUserInPeriod(...)
    // Counts tasks past due where status != COMPLETED within the createdAt window
    @Query("""
           SELECT COUNT(t)
           FROM Task t
           WHERE t.assignedTo.id = :userId
             AND t.status <> :completedStatus
             AND t.dueAt < :currentTime
             AND t.createdAt >= :startInclusive
             AND t.createdAt <  :endExclusive
           """)
    Long countOverdueTasksByUserInPeriod(@Param("userId") Long userId,
                                         @Param("completedStatus") TaskStatus completedStatus,
                                         @Param("currentTime") Instant currentTime,
                                         @Param("startInclusive") Instant startDate,
                                         @Param("endExclusive") Instant endDate);

    // ✅ Matches: taskRepository.findCompletionTimesByUserInPeriod(...)
    // Returns (createdAt, updatedAt) pairs for tasks completed in the period, regardless of when created.
    @Query("""
           SELECT t.createdAt, t.updatedAt
           FROM Task t
           WHERE t.assignedTo.id = :userId
             AND t.status = portal.faculty.faculty_portal.task.TaskStatus.COMPLETED
             AND t.createdAt >= :startInclusive
             AND t.createdAt <  :endExclusive
           """)
    List<Object[]> findCompletionTimesByUserInPeriod(@Param("userId") Long userId,
                                                     @Param("startInclusive") Instant startDate,
                                                     @Param("endExclusive") Instant endDate);

    // ---------- Older helpers (kept for compatibility) ----------
    @Deprecated
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId")
    long countByAssignedUserId(@Param("userId") Long userId);

    @Deprecated
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId AND t.createdAt BETWEEN :startDate AND :endDate")
    long countByUserInPeriod(@Param("userId") Long userId,
                             @Param("startDate") Instant startDate,
                             @Param("endDate") Instant endDate);

    @Deprecated
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId AND t.status = :status")
    long countByUserAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    @Deprecated
    @Query("""
           SELECT COUNT(t)
           FROM Task t
           WHERE t.assignedTo.id = :userId
             AND t.status = :status
             AND t.createdAt >= :startInclusive
             AND t.createdAt <  :endExclusive
           """)
    long countByUserStatusAndPeriod(@Param("userId") Long userId,
                                    @Param("status") TaskStatus status,
                                    @Param("startInclusive") Instant startDate,
                                    @Param("endExclusive") Instant endDate);
}
