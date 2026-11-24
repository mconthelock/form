pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    environment {
        GIT_SSL_NO_VERIFY = 'true'
        BASE_APP_NAME = 'form'
        STACK_NAME    = 'form'
        ENV_BASE_PATH = '/var/amecweb/file/env/form'
        TARGET_PATH   = '/var/amecweb/wwwroot'
        NODE_ENV = 'development'
    }

    stages {
        stage('Setup Environment') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'develop') {
                        env.TARGET_DIR = "${TARGET_PATH}/development/form"
                        env.ENV_DIR = "${ENV_BASE_PATH}/.env.form.development"
                        env.DEPLOY_ENV = 'development'
                        env.RSPACK_CACHE = 'true'
                        echo ">>> MR merged → develop → DEPLOY DEVELOPMENT"
                    } else if (env.BRANCH_NAME == 'main') {
                        env.TARGET_DIR = "${TARGET_PATH}/production/form"
                        env.ENV_DIR = "${ENV_BASE_PATH}/.env.form.production"
                        env.DEPLOY_ENV = 'production'
                        env.RSPACK_CACHE = 'false'
                        echo ">>> MR merged → main → DEPLOY PRODUCTION"
                    } else {
                        error "❌ Branch ${env.BRANCH_NAME} is not deployable"
                    }
                }
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
                script {
                    env.START_TIME_CHANGE = System.currentTimeMillis()
                    echo "⏱️ [START] Prepare Version : ${new Date().format('yyyy-MM-dd HH:mm:ss')}"
                }
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

                script {
                    def duration = (System.currentTimeMillis() - env.START_TIME_CHANGE.toLong()) / 1000
                    echo "✅ [END] Check Version ใช้เวลาทั้งหมด: ${duration} วินาที"
                }
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
                    script {
                        env.START_TIME_BUILD = System.currentTimeMillis()
                        echo "⏱️ [START] Install & Build : ${new Date().format('yyyy-MM-dd HH:mm:ss')}"
                    }

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
                        cleanup_git() {
                            git config --global --unset url."https://${GIT_USER}:${GIT_PASS}@webhub.mitsubishielevatorasia.co.th/".insteadOf || true
                        }
                        trap cleanup_git EXIT
                        git config --global url."https://${GIT_USER}:${GIT_PASS}@webhub.mitsubishielevatorasia.co.th/".insteadOf "https://webhub.mitsubishielevatorasia.co.th/"

                        # รัน npm install เฉพาะเมื่อ package.json / package-lock.json เปลี่ยน หรือยังไม่มี node_modules
                        NPM_HASH=$(sha256sum package.json package-lock.json 2>/dev/null | sha256sum | awk '{print $1}')
                        if [ ! -d node_modules ] || [ ! -f .npm_install_hash ] || [ "$(cat .npm_install_hash)" != "${NPM_HASH}" ]; then
                            npm install --include=dev
                            echo "${NPM_HASH}" > .npm_install_hash
                        else
                            echo "⚡ Skip npm install (package.json & package-lock.json unchanged)"
                        fi
                        npm update @amec/webasset
                        npm run build
                        # รัน docs:build เฉพาะเมื่อไฟล์ใน docs/ เปลี่ยน หรือยังไม่มี docs/dist
                        DOCS_HASH=$(find docs -type f ! -path 'docs/dist/*' ! -path 'docs/.vitepress/cache/*' | sort | tr '\n' '\0' | xargs -0 sha256sum 2>/dev/null | sha256sum | awk '{print $1}')
                        if [ ! -d docs/dist ] || [ ! -f .docs_build_hash ] || [ "$(cat .docs_build_hash)" != "${DOCS_HASH}" ]; then
                            npm run docs:build
                            echo "${DOCS_HASH}" > .docs_build_hash
                        else
                            echo "⚡ Skip docs:build (docs unchanged)"
                        fi

                        # cleanup_git จะทำงานอัตโนมัติผ่าน trap EXIT
                    '''

                    script {
                        def duration = (System.currentTimeMillis() - env.START_TIME_BUILD.toLong()) / 1000
                        echo "✅ [END] Install & Build ใช้เวลาทั้งหมด: ${duration} วินาที"
                    }
                }
            }
        }

        stage('PHP Prep (Composer)') {
            steps {
                script {
                    env.START_TIME_COMPOSER = System.currentTimeMillis()
                    echo "⏱️ [START] PHP Prep (Composer) : ${new Date().format('yyyy-MM-dd HH:mm:ss')}"
                }
                dir('application') {
                    sh 'composer install --no-dev --optimize-autoloader --no-interaction'
                }
                script {
                    def duration = (System.currentTimeMillis() - env.START_TIME_COMPOSER.toLong()) / 1000
                    echo "✅ [END] PHP Prep (Composer) ใช้เวลาทั้งหมด: ${duration} วินาที"
                }
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
                script {
                    env.START_TIME_DEPLOY = System.currentTimeMillis()
                    echo "⏱️ [START] Deploy to NAS : ${new Date().format('yyyy-MM-dd HH:mm:ss')}"
                }
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
                    rsync -rltD --delete \
                        --no-perms --no-owner --no-group \
                        --omit-dir-times \
                        --modify-window=2 \
                        --inplace \
                        --stats \
                        --exclude='node_modules' \
                        --exclude='.git' \
                        --exclude='.gitignore' \
                        --exclude='.env-sample' \
                        --exclude='.current_version' \
                        --exclude='.new_version' \
                        --exclude='.npm_install_hash' \
                        --exclude='.docs_build_hash' \
                        --exclude='assets/script' \
                        --exclude='assets/style' \
                        --exclude='*.map' \
                        --exclude='docs/.vitepress' \
                        --exclude='docs/public' \
                        --exclude='docs/form' \
                        --exclude='Jenkinsfile' \
                        --exclude='application/cache' \
                        --exclude='application/logs' \
                        --exclude='tests' \
                        --exclude='playwright.config.js' \
                        --exclude='test-results' \
                        --exclude='playwright-report' \
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

                script {
                    def duration = (System.currentTimeMillis() - env.START_TIME_DEPLOY.toLong()) / 1000
                    echo "✅ [END] Deploy to NAS ใช้เวลาทั้งหมด: ${duration} วินาที"
                }
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
                    if (cause?.shortDescription?.contains('Started by user')) {
                        buildUser = cause.shortDescription.replace('Started by user ', '')
                    }else{
                        buildUser = (cause?.shortDescription ?: '').replace('Started by GitLab push by ', '')
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
