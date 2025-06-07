FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} track-service.jar
ENTRYPOINT ["java","-jar","/track-service.jar"]
