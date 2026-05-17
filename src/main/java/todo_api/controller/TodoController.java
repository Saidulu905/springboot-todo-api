package todo_api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import todo_api.dto.TodoRequest;
import todo_api.dto.TodoResponse;
import todo_api.entity.Todo;
import todo_api.service.TodoService;

@RestController
@RequestMapping("/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    // CREATE TODO
    @PostMapping
    public TodoResponse createTodo(
            @Valid @RequestBody TodoRequest request,
            Authentication authentication
    ) {

        return todoService.createTodo(
                request,
                authentication
        );
    }

    // GET TODOS
    @GetMapping
    public Page<Todo> getTodos(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return todoService.getTodos(
                authentication,
                page,
                size
        );
    }

    // UPDATE TODO
    @PutMapping("/{id}")
    public TodoResponse updateTodo(
            @PathVariable Long id,
            @Valid @RequestBody TodoRequest request,
            Authentication authentication
    ) {

        return todoService.updateTodo(
                id,
                request,
                authentication
        );
    }

    // DELETE TODO
    @DeleteMapping("/{id}")
    public void deleteTodo(
            @PathVariable Long id,
            Authentication authentication
    ) {

        todoService.deleteTodo(
                id,
                authentication
        );
    }
}