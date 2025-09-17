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
            sh '''
              set -e
              if ! command -v node >/dev/null 2>&1; then
                export NVM_DIR="$HOME/.nvm"
                if [ ! -s "$NVM_DIR/nvm.sh" ]; then
                  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                fi
                . "$NVM_DIR/nvm.sh"
                nvm install 18
                nvm use 18
              fi
              node -v
              npm -v
            '''
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
              sh '''
                set -e
                export NVM_DIR="$HOME/.nvm"
                . "$NVM_DIR/nvm.sh" || true
                nvm use 18 || nvm install 18
                npm ci || npm install
              '''
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
              sh '''
                set -e
                export NVM_DIR="$HOME/.nvm"
                . "$NVM_DIR/nvm.sh" || true
                nvm use 18 || nvm install 18
                npm test
              '''
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


