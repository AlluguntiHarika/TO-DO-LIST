pipeline {
  agent {
    docker {
      image 'node:18-alpine'
      args '-u root:root'
    }
  }

  environment {
    NODE_ENV = 'test'
    JWT_SECRET = 'jenkins-test-secret'
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        dir('todo-backend') {
          sh 'node -v'
          sh 'npm -v'
          sh 'npm ci || npm install'
        }
      }
    }

    stage('Test') {
      steps {
        dir('todo-backend') {
          sh 'npm test'
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
    }
  }
}


