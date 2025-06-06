FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} groupdiscount-service.jar
ENTRYPOINT ["java","-jar","/groupdiscount-service.jar"]