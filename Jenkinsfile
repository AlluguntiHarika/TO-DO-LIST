pipeline {
    agent any

    environment {
        PROJECT_ID = 'global-tine-472414-v8'  // GCP project
        REPO = 'us-central1-docker.pkg.dev/global-tine-472414-v8/todo-list'
        IMAGE = "${REPO}:latest"
        GCLOUD_KEY_FILE = credentials('gcp-service-account') // Jenkins secret
        NODE_ENV = 'test'
        JWT_SECRET = 'jenkins-test-secret'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/AlluguntiHarika/TO-DO-LIST.git'
            }
        }

        stage('Install & Test Node.js') {
            steps {
                dir('todo-backend') {
                    script {
                        if (isUnix()) {
                            sh '''
                              set -e
                              export NVM_DIR="$HOME/.nvm"
                              . "$NVM_DIR/nvm.sh" || true
                              nvm install 18
                              nvm use 18
                              npm ci || npm install
                              npm test
                            '''
                        } else {
                            bat '''
                              npm ci || npm install
                              npm test
                            '''
                        }
                    }
                }
            }
        }

        stage('Authenticate GCP') {
            steps {
                sh '''
                  echo $GCLOUD_KEY_FILE > key.json
                  gcloud auth activate-service-account --key-file=key.json
                  gcloud auth configure-docker us-central1-docker.pkg.dev
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE} ."
            }
        }

        stage('Push to Artifact Registry') {
            steps {
                sh "docker push ${IMAGE}"
            }
        }
    }

    post {
        always {
            node {
                sh 'rm -f key.json'
                echo 'Pipeline finished.'
            }
        }
    }
}
