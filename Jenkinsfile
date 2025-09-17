pipeline {
  agent any

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

    stage('Verify Node.js') {
      steps {
        script {
          if (isUnix()) {
            sh 'node -v && npm -v'
          } else {
            bat 'node -v & npm -v'
          }
        }
      }
    }

    stage('Install') {
      steps {
        dir('todo-backend') {
          script {
            if (isUnix()) {
              sh 'npm ci || npm install'
            } else {
              bat 'cmd /c npm ci || npm install'
            }
          }
        }
      }
    }

    stage('Test') {
      steps {
        dir('todo-backend') {
          script {
            if (isUnix()) {
              sh 'npm test'
            } else {
              bat 'npm test'
            }
          }
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


