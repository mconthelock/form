pipeline {
    agent any

    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['development', 'production'], description: 'Select Environment to deploy')
    }

    environment {
        NAS_PATH = "\\\\172.21.255.188\\amecweb\\wwwroot\\development"
        GIT_SSL_NO_VERIFY = 'true'
    }

    tools {
        nodejs 'node'
    }

    stages {
        stage('Setup Environment') {
            steps {
                script {
                    def isManualTrigger = currentBuild.getBuildCauses().toString().contains('UserIdCause')
                    if (isManualTrigger && params.DEPLOY_ENV == 'production') {
                        env.TARGET_DIR = '/var/amecweb/wwwroot/production/form'
                        env.ENV_CRED_ID = 'form-env-prod'
                        env.NODE_ENV = 'production'
                        echo ">>> MANUAL BUILD: Deploying to PRODUCTION"
                    }else {
                        env.TARGET_DIR = '/var/amecweb/wwwroot/development/form'
                        env.ENV_CRED_ID = 'form-env-dev'
                        env.NODE_ENV = 'development'

                        if (!isManualTrigger) {
                            echo ">>> WEBHOOK DETECTED: Auto-deploying to DEVELOPMENT"
                        } else {
                            echo ">>> MANUAL BUILD: Selected DEVELOPMENT"
                        }
                    }

                    echo "Target Directory: ${env.TARGET_DIR}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        stage('Install & Build') {
            steps {
                withCredentials([file(credentialsId: "${env.ENV_CRED_ID}", variable: 'ENV_FILE')]) {
                    withCredentials([usernamePassword(credentialsId: 'gitlab-auth-id', passwordVariable: 'GIT_PASS', usernameVariable: 'GIT_USER')]) {
                        sh '''
                            cp ${ENV_FILE} .env

                            git config --global url."https://${GIT_USER}:${GIT_PASS}@webhub.mitsubishielevatorasia.co.th/".insteadOf "https://webhub.mitsubishielevatorasia.co.th/"

                            npm install
                            npm update @amec/webasset
                            npm run build
                            npm run docs:build

                            git config --global --unset url."https://${GIT_USER}:${GIT_PASS}@webhub.mitsubishielevatorasia.co.th/".insteadOf
                        '''
                    }
                }
            }
        }

        stage('PHP Prep (Composer)') {
            steps {
                dir('application') {
                    sh 'composer update --optimize-autoloader'
                }
                echo "PHP preparation with Composer done."
            }
        }

        stage('Deploy to NAS') {
            steps {
                sh '''
                    mkdir -p ${TARGET_DIR}
                    mkdir -p ${TARGET_DIR}/application/cache
                    mkdir -p ${TARGET_DIR}/application/logs

                    rsync -av --delete \
                        --exclude='node_modules' \
                        --exclude='.git' \
                        --exclude='.gitignore' \
                        --exclude='.env-sample' \
                        --exclude='Jenkinsfile' \
                        --exclude='application/cache' \
                        --exclude='application/logs' \
                        --exclude='*@tmp' \
                        ./ ${TARGET_DIR}/
                '''
            }
        }
    }

    post {
        always {
            // ส่งเมลเสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว
            script {
                def subject = "Build ${currentBuild.currentResult}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
                def details = """<p>Build Result: <b>${currentBuild.currentResult}</b></p>
                                 <p>Environment: ${env.NODE_ENV}</p>
                                 <p>Target Directory: ${env.TARGET_DIR}</p>
                                 <p>Check console output at: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>"""

                emailext (
                    subject: subject,
                    body: details,
                    to: 'chalorms@MitsubishiElevatorAsia.co.th',
                    from: 'jenkins@MitsubishiElevatorAsia.co.th',
                    mimeType: 'text/html'
                )
            }
        }
        success {
            echo "Deployment to ${env.TARGET_DIR} successful!"
        }
        failure {
            echo "Deployment failed. Please check the logs."
        }
    }
}