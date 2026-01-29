pipeline {
    agent any

    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['development', 'production'], description: 'Select Environment to deploy')
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
                        env.NODE_ENV = 'development'
                        env.DEPLOY_ENV = 'production'
                        echo ">>> MANUAL BUILD: Deploying to PRODUCTION"
                    }else {
                        env.TARGET_DIR = '/var/amecweb/wwwroot/development/form'
                        env.ENV_CRED_ID = 'form-env-dev'
                        env.NODE_ENV = 'development'
                        env.DEPLOY_ENV = 'development'

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

                            npm install --include=dev
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
            script {
                // 1. หาชื่อคนสั่ง Build (ดึงจาก Build Causes)
                def buildCauses = currentBuild.getBuildCauses()
                def buildUser = ""
                for (cause in buildCauses) {
                    if (cause.shortDescription.contains('Started by user')) {
                        buildUser = cause.shortDescription.replace('Started by user ', '')
                    }else{
                        buildUser = cause.shortDescription.replace('Started by GitLab push by ', '')
                    }
                }

                // 2. จัดการเรื่องเวลา (แปลงจาก milliseconds เป็นวันที่ที่อ่านออก)
                def startTime = new Date(currentBuild.startTimeInMillis).format("dd/MM/yyyy HH:mm:ss", TimeZone.getTimeZone('Asia/Bangkok'))
                def endTime = new Date().format("dd/MM/yyyy HH:mm:ss", TimeZone.getTimeZone('Asia/Bangkok'))

                mail (
                    to: 'sec_wsd@MitsubishiElevatorAsia.co.th',
                    subject: "Build ${currentBuild.currentResult}: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]",
                    from: 'jenkins-notify@MitsubishiElevatorAsia.co.th',
                    body: """
                        ข้อมูลการ Build เบื้องต้น:
                        -------------------------------------------
                        ผลการทำงาน: ${currentBuild.currentResult}
                        ผู้ดำเนินการ: ${buildUser}
                        เวลาที่เริ่ม: ${startTime}
                        เวลาที่เสร็จ: ${endTime}
                        ระยะเวลาทั้งหมด: ${currentBuild.durationString.replace(' and counting', '')}

                        รายละเอียดสภาพแวดล้อม:
                        -------------------------------------------
                        Environment: ${env.DEPLOY_ENV}
                        Target Directory: ${env.TARGET_DIR}

                        สามารถตรวจสอบ Log อย่างละเอียดได้ที่:
                        ${env.BUILD_URL}console
                        -------------------------------------------
                    """
                )
            }
        }
    }
}