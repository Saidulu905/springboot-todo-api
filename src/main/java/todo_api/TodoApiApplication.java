package todo_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class TodoApiApplication {

	public static void main(String[] args) {
		configureRenderDatabaseUrl();
		SpringApplication.run(TodoApiApplication.class, args);
	}

	private static void configureRenderDatabaseUrl() {
		if (System.getenv("DB_URL") != null || System.getenv("DATABASE_URL") == null) {
			return;
		}

		URI databaseUri = URI.create(System.getenv("DATABASE_URL"));
		String[] userInfo = databaseUri.getUserInfo().split(":", 2);
		String host = databaseUri.getHost();
		int port = databaseUri.getPort();
		String database = databaseUri.getPath();
		String query = databaseUri.getQuery();

		String jdbcUrl = "jdbc:postgresql://" + host
				+ (port == -1 ? "" : ":" + port)
				+ database
				+ (query == null ? "" : "?" + query);

		System.setProperty("spring.datasource.url", jdbcUrl);
		System.setProperty(
				"spring.datasource.username",
				URLDecoder.decode(userInfo[0], StandardCharsets.UTF_8)
		);
		System.setProperty(
				"spring.datasource.password",
				URLDecoder.decode(userInfo[1], StandardCharsets.UTF_8)
		);
	}

}
