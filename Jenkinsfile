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
        APP_PORT       = '3000'
        HOST_PORT      = '3000'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Pre checks- debug ') {
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
                    echo "Installing Node.js dependencies..."
                    npm ci --audit=false
                    echo "Dependencies installed"
                '''
            }
        }

        stage('Dependency Security Scan') {
            steps { 
                echo "Running npm audit..."
                sh 'npm audit --audit-level=high'
                echo "npm audit completed"
            }
     }

        
        stage('Test') {
            steps {
                echo "Executing test suite..."
                sh 'npm test'
                echo "Tests completed successfully"
            }
        }



        stage('Build Container Image') {
            steps {
                sh '''
                    echo "Building sample api Podman image..."
                    podman build \
                      --cgroup-manager=cgroupfs \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      -t ${IMAGE_NAME}:latest .
                    echo "Build completed"
                    podman images | grep ${IMAGE_NAME}
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                    echo "Scanning image with Trivy...."

                    trivy image \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    --format json \
                    --output trivy-report.json \
                    ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }


        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | podman login docker.io \
                        -u "$DOCKER_USER" --password-stdin

                        podman tag ${IMAGE_NAME}:${IMAGE_TAG} \
                        docker.io/dayanand1991/sample-api-podman-image:${IMAGE_TAG}

                        podman push docker.io/dayanand1991/sample-api-podman-image:${IMAGE_TAG}
                    '''
                }
            }
        }



        stage('Deploy to Podman') {
            steps {
                sh '''
                    set -e
                    echo "Removing old container if exists..."
                    podman rm -f ${CONTAINER_NAME} || true

                    echo "starting new container..."
                    podman run -d \
                      --name ${CONTAINER_NAME} \
                      --label build=${BUILD_NUMBER} \
                      --cgroup-manager=cgroupfs \
                      -p ${HOST_PORT}:${APP_PORT} \
                      ${IMAGE_NAME}:${IMAGE_TAG}

                    sleep 3
                    echo "Running containers:"
                    podman ps
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

    //     stage('Verification') {
    //         steps {
    //             sh '''
    //                 podman ps
    //                 podman images | grep ${IMAGE_NAME}
    //             '''
    //         }
    //     }
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
            archiveArtifacts artifacts: 'trivy-report.json', fingerprint: true
        }
    }
}