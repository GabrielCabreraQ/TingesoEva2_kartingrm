FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} pricing-service.jar
ENTRYPOINT ["java","-jar","/pricing-service.jar"]