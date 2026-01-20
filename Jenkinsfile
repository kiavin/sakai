pipeline {
    agent any

    environment {
        APP_NAME = 'kardiverse_frontend'
        IMAGE_NAME = "${APP_NAME}:latest"
    // Backend URL can optionally be stored as a secret in Jenkins
    // BACKEND_URL = 'http://172.20.0.31'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Network') {
            steps {
                script {
                    echo '--- Skipping Docker network creation, not needed ---'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "--- Building Docker image ${IMAGE_NAME} ---"
                    sh "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Deploy to Frontend VM') {
            steps {
                // Use SSH key stored in Jenkins for frontend VM
                sshagent(['vue-vm34']) {
                    // Pull the VM IP from Jenkins secret
                    withCredentials([string(credentialsId: 'vue-vm34', variable: 'frontend-vm')]) {
                        script {
                            echo "--- Deploying ${APP_NAME} to ${frontend-vm} ---"
                            sh """
                                # Save Docker image to a tar.gz
                                docker save ${IMAGE_NAME} | gzip > /tmp/${APP_NAME}.tar.gz

                                # Copy image to target VM
                                scp /tmp/${APP_NAME}.tar.gz nova@${frontend-vm}:/tmp/

                                # Load and run image on target VM
                                ssh nova@${frontend-vm} '
                                    docker rm -f ${APP_NAME} || true
                                    docker load -i /tmp/${APP_NAME}.tar.gz
                                    docker run -d --name ${APP_NAME} -p 80:80 ${IMAGE_NAME}
                                '

                                # Clean up tar file
                                rm -f /tmp/${APP_NAME}.tar.gz
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo '--- 🧹 Cleaning Up 🧹 ---'
                cleanWs()
                sh 'docker system prune -f'
            }
        }
        success {
            script {
                echo "✅ Deployment of ${APP_NAME} Complete"
            }
        }
    }
}
