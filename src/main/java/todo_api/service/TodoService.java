package todo_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import todo_api.dto.TodoRequest;
import todo_api.dto.TodoResponse;
import todo_api.entity.Todo;
import todo_api.entity.User;
import todo_api.repository.TodoRepository;
import todo_api.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    // CREATE TODO
    public TodoResponse createTodo(
            TodoRequest request,
            Authentication authentication
    ) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();

        Todo todo = Todo.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .user(user)
                .build();

        Todo savedTodo = todoRepository.save(todo);

        return TodoResponse.builder()
                .id(savedTodo.getId())
                .title(savedTodo.getTitle())
                .description(savedTodo.getDescription())
                .userEmail(user.getEmail())
                .build();
    }

    // GET TODOS
    public Page<Todo> getTodos(
            Authentication authentication,
            int page,
            int size
    ) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();

        Pageable pageable =
                PageRequest.of(page, size);

        return todoRepository.findByUser(user, pageable);
    }

    // UPDATE TODO
    public TodoResponse updateTodo(
            Long id,
            TodoRequest request,
            Authentication authentication
    ) {

        Todo todo = todoRepository.findById(id)
                .orElseThrow();

        if (!todo.getUser().getEmail()
                .equals(authentication.getName())) {

            throw new RuntimeException("Forbidden");
        }

        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());

        Todo updatedTodo = todoRepository.save(todo);

        return TodoResponse.builder()
                .id(updatedTodo.getId())
                .title(updatedTodo.getTitle())
                .description(updatedTodo.getDescription())
                .userEmail(updatedTodo.getUser().getEmail())
                .build();
    }

    // DELETE TODO
    public void deleteTodo(
            Long id,
            Authentication authentication
    ) {

        Todo todo = todoRepository.findById(id)
                .orElseThrow();

        if (!todo.getUser().getEmail()
                .equals(authentication.getName())) {

            throw new RuntimeException("Forbidden");
        }

        todoRepository.delete(todo);
    }
}