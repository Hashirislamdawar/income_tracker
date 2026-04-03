pipeline {
    agent any

    environment {
        // Your Docker Hub credentials ID (needs to be configured in Jenkins)
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_IMAGE = 'hashirislam1012/income-tracker'
        DOCKER_TAG = "${env.BUILD_NUMBER}" // Defaults to build number, can be parameterized
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from Git
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                    // Next.js Docker build using your existing Dockerfile
                    sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest .'
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                script {
                    echo "Pushing Image to Docker Hub..."
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_HUB_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
                        sh 'docker push ${DOCKER_IMAGE}:latest'
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
            // Optionally, remove the local image to free up space on Jenkins node
            sh 'docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true'
            sh 'docker rmi ${DOCKER_IMAGE}:latest || true'
            sh 'docker logout'
        }
        success {
            echo "Pipeline succeeded! Image pushed to Docker Hub."
        }
        failure {
            echo "Pipeline failed! Please check the logs."
        }
    }
}
