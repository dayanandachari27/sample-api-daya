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
                    
                    echo "Removing old tar if exists..." 
                    rm -f sample-api.tar
                
                    echo "Saving image as tar..."
                    podman save -o sample-api.tar ${IMAGE_NAME}:${IMAGE_TAG}

                    echo "Scanning image with Trivy...."

                    trivy image \
                      --input sample-api.tar \
                      --severity CRITICAL \
                      --format json \
                      --output trivy-report.json
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
                        set -e

                        REGISTRY_IMAGE=docker.io/dayanand1991/sample-api-podman-image:${IMAGE_TAG}

                        echo "$DOCKER_PASS" | podman login docker.io \
                        -u "$DOCKER_USER" --password-stdin

                        podman tag ${IMAGE_NAME}:${IMAGE_TAG} $REGISTRY_IMAGE

                        podman push $REGISTRY_IMAGE

                        podman logout docker.io
                    '''
                }
            }
        }



        stage('Deploy to Podman') {
            steps {
                sh '''
                    set -e
                    REGISTRY_IMAGE=docker.io/dayanand1991/sample-api-podman-image:${IMAGE_TAG}

                    echo "$DOCKER_PASS" | podman login docker.io \
                    -u "$DOCKER_USER" --password-stdin

                    echo "Pull latest approved image..."
                    podman pull $REGISTRY_IMAGE

                    echo "Removing old container if exists..."
                    podman rm -f ${CONTAINER_NAME} || true

                    echo "Starting new container..."
                    podman run -d \
                    --name ${CONTAINER_NAME} \
                    --label build=${BUILD_NUMBER} \
                    --cgroup-manager=cgroupfs \
                    -p ${HOST_PORT}:${APP_PORT} \
                    $REGISTRY_IMAGE

                    sleep 5

                    echo "Running containers after deployment..."
                    podman ps

                    podman logout docker.io
                '''
            }
        }

        stage('post-deployment verification') {
            steps {
                sh '''
                    sleep 5
                    curl --fail http://localhost:${HOST_PORT}
                    curl --fail http://localhost:${HOST_PORT}/employees
                    curl --fail http://localhost:${HOST_PORT}/health

                '''
            }
        }

        // related to api end point not accessible due to some reason, how you will resolve it or debug
        // how you will move this build from one env to another env, what will be your branching strategy, what will be your rollback strategy in case of failure in prod env, how you will do regression test in case of prod env deployment, these are the questions to be answered in this stage
        // rollback strategy to be implemented in case of failure in prod env
        // branching sstrategy to be implemented for dev, staging and prod env
        // regression test to be implemented in case of prod env deployment
        // version control strategy to be implemented for dev, staging and prod env

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

        cleanup {
            sh '''
                echo "Cleaning tar files..."
                rm -f *.tar  || true

                echo "Removing dangling Podman images..."
                podman image prune -f || true

                echo "Cleaning workspace..."
            '''
            cleanWs()
        }
    }
}