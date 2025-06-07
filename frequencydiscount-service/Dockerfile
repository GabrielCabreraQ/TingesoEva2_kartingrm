FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} frequencydiscount-service.jar
ENTRYPOINT ["java","-jar","/frequencydiscount-service.jar"]
