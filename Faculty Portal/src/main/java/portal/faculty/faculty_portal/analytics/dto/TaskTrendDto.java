package portal.faculty.faculty_portal.analytics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskTrendDto {
    private String month;
    private Integer assigned;
    private Integer completed;
    private Integer overdue;
}
