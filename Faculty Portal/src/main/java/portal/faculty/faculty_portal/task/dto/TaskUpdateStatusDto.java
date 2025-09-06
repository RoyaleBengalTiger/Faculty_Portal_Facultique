package portal.faculty.faculty_portal.task.dto;

import lombok.Data;

@Data
public class TaskUpdateStatusDto {
    private String status; // ASSIGNED/IN_PROGRESS/SUBMITTED/OVERDUE/COMPLETED
}
