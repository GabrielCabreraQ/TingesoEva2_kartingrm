FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} incomingreport-service.jar
ENTRYPOINT ["java","-jar","/incomingreport-service.jar"]
