FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} specialdays-service.jar
ENTRYPOINT ["java","-jar","/specialdays-service.jar"]
