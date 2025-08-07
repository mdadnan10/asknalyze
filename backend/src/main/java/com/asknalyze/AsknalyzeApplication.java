package com.asknalyze;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AsknalyzeApplication {

	public static void main(String[] args) {
		SpringApplication.run(AsknalyzeApplication.class, args);
	}

}
