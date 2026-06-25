package com.projectcyan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ProjectCyanApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectCyanApplication.class, args);
	}

}
