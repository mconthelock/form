pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    stages {
        stage('Setup Environment') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'develop') {
                        env.TARGET_DIR = '/var/amecweb/wwwroot/development/form'
                        env.ENV_DIR = '/var/amecweb/file/env/form/.env.form.development'
                        env.NODE_ENV = 'development'
                        env.DEPLOY_ENV = 'development'

                        echo ">>> MR merged → develop → DEPLOY DEVELOPMENT"

                    } else if (env.BRANCH_NAME == 'main') {

                        env.TARGET_DIR = '/var/amecweb/wwwroot/production/form'
                        env.ENV_DIR = '/var/amecweb/file/env/form/.env.form.production'
                        env.NODE_ENV = 'development'
                        env.DEPLOY_ENV = 'production'

                        echo ">>> MR merged → main → DEPLOY PRODUCTION"

                    } else {
                        error "❌ Branch ${env.BRANCH_NAME} is not deployable"
                    }
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        // ============================================================
        // Prepare Version
        // ============================================================
        // หน้าที่:
        //   - อ่าน VERSION ปัจจุบันจาก ${ENV_DIR}
        //   - ตรวจสอบ format ว่าเป็น major.minor.patch
        //   - คำนวณ VERSION ใหม่ โดยเพิ่ม PATCH + 1
        //   - เก็บ CURRENT_VERSION / NEW_VERSION ไว้ให้ Stage อื่นใช้
        //
        // สำคัญ:
        //   Stage นี้ "ยังไม่แก้ ${ENV_DIR}"
        //   เพราะถ้า Build ไม่ผ่าน เราไม่ต้อง rollback
        // ============================================================
        stage('Prepare Version') {
            steps {
                sh '''
                    # --------------------------------------------------
                    # อ่าน VERSION ปัจจุบันจาก ENV_DIR
                    #
                    # ตัวอย่าง:
                    # ENV_DIR = .env.production
                    # VERSION=1.2.10
                    #
                    # จะได้:
                    # CURRENT_VERSION=1.2.10
                    # --------------------------------------------------
                    CURRENT_VERSION=$(grep "^VERSION=" "${ENV_DIR}" \
                        | head -n 1 \
                        | cut -d "=" -f 2 \
                        | tr -d "[[:cntrl:]]")


                    # --------------------------------------------------
                    # ตรวจสอบว่า VERSION เป็นรูปแบบ:
                    #
                    # major.minor.patch
                    #
                    # เช่น:
                    # 1.2.10       ✅
                    # 10.20.100    ✅
                    # 1.2          ❌
                    # v1.2.10      ❌
                    # 1.2.10-beta  ❌
                    # --------------------------------------------------
                    if ! printf '%s\\n' "${CURRENT_VERSION}" \
                        | grep -Eq "^[0-9]+[.][0-9]+[.][0-9]+$"; then

                        echo "VERSION must use the format major.minor.patch"
                        exit 1
                    fi


                    # --------------------------------------------------
                    # แยก VERSION ออกเป็น
                    #
                    # 1.2.10
                    # │ │  │
                    # │ │  └── PATCH
                    # │ └───── MINOR
                    # └─────── MAJOR
                    # --------------------------------------------------

                    MAJOR_VERSION=${CURRENT_VERSION%%.*}

                    VERSION_REMAINDER=${CURRENT_VERSION#*.}

                    MINOR_VERSION=${VERSION_REMAINDER%%.*}

                    PATCH_VERSION=${VERSION_REMAINDER#*.}


                    # --------------------------------------------------
                    # เพิ่ม PATCH VERSION + 1
                    #
                    # เช่น:
                    # 1.2.10 → 1.2.11
                    # 1.2.99 → 1.2.100
                    # --------------------------------------------------
                    NEW_VERSION="${MAJOR_VERSION}.${MINOR_VERSION}.$((PATCH_VERSION + 1))"


                    # --------------------------------------------------
                    # แสดง Version ให้ดูใน Jenkins Console
                    # --------------------------------------------------
                    echo "========================================"
                    echo "Current Version : ${CURRENT_VERSION}"
                    echo "New Version     : ${NEW_VERSION}"
                    echo "========================================"


                    # --------------------------------------------------
                    # เก็บ Version ไว้ในไฟล์ชั่วคราว
                    #
                    # Stage ต่อไปสามารถอ่านได้ด้วย:
                    #
                    # CURRENT_VERSION=$(cat .current_version)
                    # NEW_VERSION=$(cat .new_version)
                    #
                    # ใช้ไฟล์แทนการแก้ ${ENV_DIR}
                    # --------------------------------------------------
                    echo "${CURRENT_VERSION}" > .current_version
                    echo "${NEW_VERSION}" > .new_version


                    # --------------------------------------------------
                    # เตรียม .env สำหรับ Build
                    #
                    # ตรงนี้แก้เฉพาะ .env
                    #
                    # ${ENV_DIR} ยังเป็น Version เดิม
                    #
                    # เช่น:
                    #
                    # ${ENV_DIR}
                    # VERSION=1.2.10
                    #
                    # .env
                    # VERSION=1.2.11
                    # --------------------------------------------------
                    cp "${ENV_DIR}" .env

                    sed -i "s/^VERSION=.*/VERSION=${NEW_VERSION}/" .env


                    # --------------------------------------------------
                    # แสดง VERSION ที่จะใช้ Build
                    # --------------------------------------------------
                    echo "Build Version:"
                    grep "^VERSION=" .env
                '''
            }
        }

        // ============================================================
        // Build
        // ============================================================
        // หน้าที่:
        //   - Build application ด้วย VERSION ใหม่
        //
        // ถ้า Build fail:
        //   - Jenkins stage นี้จะ fail
        //   - Deploy to NAS จะไม่ทำงาน
        //   - Update Version จะไม่ทำงาน
        //   - ${ENV_DIR} ยังคงเป็น VERSION เดิม
        //
        // ตัวอย่าง:
        //
        // ${ENV_DIR}
        // VERSION=1.2.10
        //
        // .env
        // VERSION=1.2.11
        //
        // Build ❌
        //
        // ผลลัพธ์:
        // ${ENV_DIR} ยังเป็น 1.2.10
        // ============================================================
        stage('Install & Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'gitlab-auth-id', passwordVariable: 'GIT_PASS', usernameVariable: 'GIT_USER')]) {
                    sh '''
                        # อ่าน Version ที่เตรียมไว้
                        NEW_VERSION=$(cat .new_version)

                        echo "========================================"
                        echo "Building version: ${NEW_VERSION}"
                        echo "========================================"

                        # --------------------------------------------------
                        # Build application
                        #
                        # ถ้า command นี้ exit code != 0
                        # Jenkins จะถือว่า Stage นี้ FAILED
                        #
                        # และ Stage Deploy to NAS จะไม่ถูก execute
                        # --------------------------------------------------
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

        stage('PHP Prep (Composer)') {
            steps {
                dir('application') {
                    sh 'composer update --optimize-autoloader'
                }
                echo "PHP preparation with Composer done."
            }
        }
        // ============================================================
        // Deploy to NAS
        // ============================================================
        // หน้าที่:
        //   - เอาไฟล์ที่ Build สำเร็จแล้วไปยัง NAS
        //
        // สำคัญ:
        //   Stage นี้จะทำงานได้ก็ต่อเมื่อ Build ผ่าน
        //
        // ถ้า rsync fail:
        //   - Jenkins stage นี้ FAILED
        //   - Update Version จะไม่ทำงาน
        //   - ${ENV_DIR} ยังคง Version เดิม
        // ============================================================
        stage('Deploy to NAS') {
            steps {
                sh '''
                    # --------------------------------------------------
                    # สร้าง Directory ที่จำเป็นบน NAS
                    # --------------------------------------------------
                    mkdir -p ${TARGET_DIR}

                    mkdir -p ${TARGET_DIR}/application/cache

                    mkdir -p ${TARGET_DIR}/application/logs


                    # --------------------------------------------------
                    # Copy ไฟล์จาก Jenkins Workspace
                    # ไปยัง NAS
                    #
                    # --delete
                    #   ลบไฟล์ปลายทางที่ไม่มีอยู่ใน source
                    #
                    # --exclude
                    #   ไม่ copy directory/file ที่กำหนด
                    # --------------------------------------------------
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


                    # --------------------------------------------------
                    # ถ้า rsync สำเร็จ จะมาถึงตรงนี้
                    #
                    # หมายความว่า:
                    # Build สำเร็จ
                    # และ
                    # Deploy NAS สำเร็จ
                    # --------------------------------------------------
                    echo "========================================"
                    echo "Deploy to NAS completed successfully"
                    echo "========================================"
                '''
            }
        }

        // ============================================================
        // Update Version
        // ============================================================
        // หน้าที่:
        //   - Update VERSION จริงใน ${ENV_DIR}
        //
        // Stage นี้จะทำงานก็ต่อเมื่อ:
        //   1. Prepare Version ผ่าน
        //   2. Build ผ่าน
        //   3. Deploy NAS ผ่าน
        //
        // ดังนั้น VERSION จริงจะเปลี่ยนหลังจาก Deploy สำเร็จเท่านั้น
        //
        // ตัวอย่าง:
        //
        // ก่อน:
        // ${ENV_DIR}
        // VERSION=1.2.10
        //
        // Build:
        // .env
        // VERSION=1.2.11
        //
        // Deploy:
        // NAS ได้ VERSION=1.2.11
        //
        // จากนั้น:
        // ${ENV_DIR}
        // VERSION=1.2.11
        // ============================================================
        stage('Update Version') {
            steps {
                sh '''
                    # --------------------------------------------------
                    # อ่าน Version
                    # --------------------------------------------------
                    CURRENT_VERSION=$(cat .current_version)

                    NEW_VERSION=$(cat .new_version)


                    # --------------------------------------------------
                    # Update VERSION จริง
                    #
                    # ตอนนี้ปลอดภัยแล้ว เพราะ
                    # Build + Deploy ผ่านหมดแล้ว
                    # --------------------------------------------------
                    sed -i "s/^VERSION=.*/VERSION=${NEW_VERSION}/" "${ENV_DIR}"


                    # --------------------------------------------------
                    # แสดงผลใน Jenkins Console
                    # --------------------------------------------------
                    echo "========================================"
                    echo "Version updated successfully"
                    echo "Version: ${CURRENT_VERSION} -> ${NEW_VERSION}"
                    echo "========================================"
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