package todo_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TodoRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
}