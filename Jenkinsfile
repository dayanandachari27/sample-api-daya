```groovy
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        IMAGE_NAME     = 'sample-api'
        IMAGE_TAG      = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'sample-api-container'
        APP_PORT       = '3001'
        HOST_PORT      = '3001'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Pre-Checks') {
            steps {
                sh '''
                    node -v
                    npm -v
                    podman --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install
                '''
            }
        }

        stage('Build Container Image') {
            steps {
                sh '''
                    podman build \
                      --cgroup-manager=cgroupfs \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      -t ${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                    podman rm -f ${CONTAINER_NAME} || true

                    podman run -d \
                      --name ${CONTAINER_NAME} \
                      --cgroup-manager=cgroupfs \
                      -p ${HOST_PORT}:${APP_PORT} \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    sleep 5
                    curl --fail http://localhost:${HOST_PORT}/health
                '''
            }
        }

        stage('Verification') {
            steps {
                sh '''
                    podman ps
                    podman images | grep ${IMAGE_NAME}
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully'
        }

        failure {
            echo 'Pipeline failed'
            sh 'podman logs ${CONTAINER_NAME} || true'
        }

        always {
            sh 'podman ps -a || true'
        }
    }
}
```
