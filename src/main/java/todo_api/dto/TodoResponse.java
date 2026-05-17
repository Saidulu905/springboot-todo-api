package todo_api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TodoResponse {

    private Long id;

    private String title;

    private String description;

    private String userEmail;
}