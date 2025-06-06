pipeline {
    agent any
    stages{
        stage('Npm install'){
            steps{
                bat 'npm install'
            }
        }

        stage('Build Front'){
            steps{
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/GabrielCabreraQ/Tingeso1-kartingrm-frontend']])
                bat 'npm run build'
            }
        }

        stage('Build docker image'){
            steps{
                script{
                    bat 'docker build -t gabrielcq/kartingrm-frontend:latest .'
                }
            }
        }
        stage('Push image to Docker Hub'){
            steps{
                script{
                    withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'docker-user', passwordVariable: 'docker-pass')]) {
                         bat "docker build -t gabrielcq/kartingrm-frontend ."
                         bat 'docker login -u %docker-user% -p %docker-pass%'
                         bat "docker push gabrielcq/kartingrm-frontend"
                }
            }
        }
    }
}
}
