const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.APP_ENV || 'http://localhost:8080/form';

const MOCK_USERS = {
    24008: {
        SEMPNO: '24008',
        SNAME: 'MR. SUTTHIPONG TANGMONGKHONCHAROEN',
        SDIV: 'INFORMATION SYSTEM DIV.',
        SDIVCODE: '050101',
        SDEPT: 'IS DEVELOPMENT DEPT.',
        SDEPCODE: '050601',
        SSEC: 'WEB SYSTEM SEC.',
        SSECCODE: '050604',
        SPOSCODE: '40',
        CSTATUS: '1',
    },
    12069: {
        SEMPNO: '12069',
        SNAME: 'MR. TEST REQUESTER',
        SDIV: 'QUALITY ASSURANCE DIV.',
        SDIVCODE: '020101',
        SDEPT: 'QA DEPT.',
        SDEPCODE: '020201',
        SSEC: 'QA SEC.',
        SSECCODE: '020202',
        SPOSCODE: '50',
        CSTATUS: '1',
    },
};

const MOCK_IMAGE =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const MOCK_OBJECTIVES = [
    { OBJ_ID: 1, OBJ_NAME: 'Cost Reduction' },
    { OBJ_ID: 2, OBJ_NAME: 'Work Efficiency' },
    { OBJ_ID: 8, OBJ_NAME: 'Other' },
];

const MOCK_POSITIONS = [
    { SPOSCODE: '20', SPOSITION: 'Director' }, // Filtered out (<= 30)
    { SPOSCODE: '40', SPOSITION: 'Engineer' },
    { SPOSCODE: '50', SPOSITION: 'Senior Engineer' },
    { SPOSCODE: '85', SPOSITION: 'Staff' }, // Filtered out (>= 80)
];

const CURRENT_YEAR = new Date().getFullYear().toString();

const MOCK_LABOR_COST = [
    { FYEAR: CURRENT_YEAR, POSITION: '40', COST: 500 },
    { FYEAR: CURRENT_YEAR, POSITION: '50', COST: 800 },
];

const MOCK_DEVICES = [
    { DNO: 1, DEVICE: 'Desktop PC', STANDARD_COST: 25000 },
    { DNO: 2, DEVICE: 'Barcode Scanner', STANDARD_COST: 5000 },
];

const MOCK_SHOW_DATA = [
    {
        NFRMNO: 13,
        VORGNO: '050601',
        CYEAR: '25',
        CYEAR2: CURRENT_YEAR,
        NRUNNO: 101,
        EMPNO: '24008',
        SYSTEMNAME: 'Webflow System',
        TITLE: 'Automate IS-DEV Requisition Approval',
        PURPOSE: 'Line 1: Reduce manual paper routing\nLine 2: Track status online',
        OBJECTIVE: '1',
        OBJECTIVE_OTHER: '',
        objective: {
            OBJ_ID: 1,
            OBJ_NAME: 'Cost Reduction',
        },
        category: {
            CATEGORY_NAME: 'New Program/Additional Request',
        },
        CURRENT_WORKFLOW: 'Print paper form and sign manually',
        EXPECTED_WORKFLOW: 'Submit and approve online via Webflow',
    },
];

async function setupApiMocks(page) {
    // Mock Calendar API
    await page.route('**/calendar/range', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
        });
    });

    // Mock User Image API
    await page.route('**/users/image/*', async (route) => {
        const url = route.request().url();
        const empno = url.split('/').pop();
        if (MOCK_USERS[empno]) {
            await route.fulfill({
                status: 200,
                contentType: 'text/plain',
                body: MOCK_IMAGE,
            });
        } else {
            await route.fulfill({ status: 404, body: 'Not found' });
        }
    });

    // Mock User Info API
    await page.route('**/users/*', async (route) => {
        const url = route.request().url();
        if (url.includes('/users/image/') || url.includes('/users/search')) {
            return route.fallback();
        }
        const empno = url.split('/').pop();
        if (MOCK_USERS[empno]) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_USERS[empno]),
            });
        } else {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'User not found' }),
            });
        }
    });

    // Mock Objective Master API
    await page.route('**/form/is/is-dev/objective/all', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_OBJECTIVES),
        });
    });

    // Mock Position Master API
    await page.route('**/amec/pposition/all', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_POSITIONS),
        });
    });

    // Mock Labor Cost API
    await page.route('**/form/is/is-dev/laborcost/all', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_LABOR_COST),
        });
    });

    // Mock Device Master API
    await page.route('**/form/is/is-dev/device/all', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_DEVICES),
        });
    });

    // Mock Search Form Data API (for show view)
    await page.route('**/form/is/is-dev/search', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_SHOW_DATA),
        });
    });
}

test.describe('IS-DEV Form Controller (application/controllers/isform/IS-DEV/Form.php)', () => {
    test.beforeEach(async ({ page }) => {
        await setupApiMocks(page);
    });

    test.describe('Create Mode: main() without NRUNNO', () => {
        test('should render create view with correct form properties and initialize requester & master data', async ({
            page,
        }) => {
            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/main?no=13&orgNo=050601&y=25&empno=24008`,
            );

            // Check heading & form existence
            await expect(page.locator('h1').first()).toContainText(
                'Computer program Requisition Form',
            );
            await expect(page.locator('#form-is-dev')).toBeVisible();

            // Check hidden inputs mapped from controller
            await expect(page.locator('input[data-map="CATEGORY"]')).toHaveValue('2');
            await expect(page.locator('input[data-map="PLANYEAR"]')).toHaveValue(
                CURRENT_YEAR,
            );
            await expect(page.locator('#NFRMNO')).toHaveValue('13');
            await expect(page.locator('#VORGNO')).toHaveValue('050601');
            await expect(page.locator('#CYEAR')).toHaveValue('25');
            await expect(page.locator('#EMPNO')).toHaveValue('24008');

            // Check requester & input-by loaded via setRequester()
            await expect(page.locator('#req-by-name')).toHaveText(
                MOCK_USERS['24008'].SNAME,
            );
            await expect(page.locator('#req-by-id')).toHaveText('24008');
            await expect(page.locator('#req-by-organization')).toContainText(
                'INFORMATION SYSTEM DIV. - IS DEVELOPMENT DEPT. - WEB SYSTEM SEC.',
            );
            await expect(page.locator('#input-by-name')).toHaveText(
                MOCK_USERS['24008'].SNAME,
            );

            // Check initial rows added to Labor and Investment tables
            await expect(page.locator('#table-labor tbody tr')).toHaveCount(1);
            await expect(page.locator('#table-investment tbody tr')).toHaveCount(1);

            // Check filtered positions in Labor select (only 30 < code < 80)
            const posOptions = page.locator(
                '#table-labor tbody tr:first-child .select-position option',
            );
            await expect(posOptions).toHaveCount(3); // Placeholder + Engineer (40) + Senior Engineer (50)
        });

        test('should allow changing requester employee and show error when employee is not found', async ({
            page,
        }) => {
            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/main?empno=24008`,
            );
            await expect(page.locator('#req-by-name')).toHaveText(
                MOCK_USERS['24008'].SNAME,
            );

            // Click button to change requester
            await page.locator('#change-req-employee').click();
            await expect(page.locator('#req-by-input')).toBeVisible();
            await expect(page.locator('#req-by-info')).toBeHidden();

            // Enter invalid employee ID
            await page.locator('#req-by-input').fill('99999');
            await page.locator('#req-by-input').dispatchEvent('change');
            await expect(page.locator('.msg-notify .msg-txt')).toContainText(
                'Employee do not found.',
            );

            // Enter valid employee ID (12069)
            await page.locator('#req-by-input').fill('12069');
            await page.locator('#req-by-input').dispatchEvent('change');

            await expect(page.locator('#req-by-info')).toBeVisible();
            await expect(page.locator('#req-by-name')).toHaveText(
                MOCK_USERS['12069'].SNAME,
            );
            await expect(page.locator('#req-by-id')).toHaveText('12069');
        });

        test('should toggle ROI sections when switching Request Type and count textarea characters', async ({
            page,
        }) => {
            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/main?empno=24008`,
            );

            // Request Type 1 (default) shows .form-roi
            await expect(page.locator('.form-roi').first()).toBeVisible();

            // Select Request Type 3 (Fixed Error Program) -> hides .form-roi
            await page.locator('input.request-type[value="3"]').click();
            await expect(page.locator('.form-roi').first()).toBeHidden();

            // Select Request Type 2 (Modify Program) -> shows .form-roi again
            await page.locator('input.request-type[value="2"]').click();
            await expect(page.locator('.form-roi').first()).toBeVisible();

            // Check detail character counter
            const detailTextarea = page.locator('textarea[name="detail"]');
            await detailTextarea.fill('Test description');
            await detailTextarea.dispatchEvent('keyup');
            await expect(page.locator('#detail-count')).toHaveText('16');
            await expect(page.locator('#detail-count')).toHaveClass(/text-red-500/);

            // Check adding additional file input
            await expect(
                page.locator('.file-input-wrap input[type="file"]'),
            ).toHaveCount(1);
            await page.locator('#add-file').click();
            await expect(
                page.locator('.file-input-wrap input[type="file"]'),
            ).toHaveCount(2);
        });

        test('should calculate Benefit, Labor, Investment, and total ROI accurately', async ({
            page,
        }) => {
            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/main?empno=24008`,
            );

            // 1. Running Cost in Benefit Table (Row 0): Present = 100 KB, Future = 40 KB -> Diff = 60.00 KB
            const benefitRow0 = page.locator('#table-benefit tbody tr').first();
            await benefitRow0.locator('.present-cost').fill('100');
            await benefitRow0.locator('.present-cost').dispatchEvent('change');
            await benefitRow0.locator('.future-cost').fill('40');
            await benefitRow0.locator('.future-cost').dispatchEvent('change');
            await expect(benefitRow0.locator('.subtotal-cost')).toHaveValue('60.00');

            // 2. Labor Table: Select Position '40' (Cost = 500), Present = 200 hrs, Future = 100 hrs
            // Diff = 100 hrs, Labor Cost = 50,000 Baht (50.00 KB)
            const laborRow0 = page.locator('#table-labor tbody tr').first();
            await laborRow0.locator('.select-position').selectOption('40');
            await expect(laborRow0.locator('.labor-cost')).toHaveValue('500');

            await laborRow0.locator('.labor-present').fill('200');
            await laborRow0.locator('.labor-present').dispatchEvent('change');
            await laborRow0.locator('.labor-future').fill('100');
            await laborRow0.locator('.labor-future').dispatchEvent('change');

            await expect(laborRow0.locator('.labor-time')).toHaveValue('100');
            await expect(laborRow0.locator('.labor-total')).toHaveValue('50,000');
            await expect(page.locator('#labor-total-benefit')).toHaveValue('50.00');

            // Total Benefit should now be 60 + 50 = 110.00 KB
            await expect(
                page.locator('#table-benefit tfoot .total-benefit'),
            ).toHaveValue('110.00');

            // 3. Investment Table: Select Device '1' (25,000 Baht), Qty = 2 -> 50,000 Baht (50 KB)
            const investRow0 = page.locator('#table-investment tbody tr').first();
            await investRow0.locator('.select-device').selectOption('1');
            await investRow0.locator('.select-device').click();
            await expect(investRow0.locator('.device-cost')).toHaveValue('25,000');

            await investRow0.locator('.device-qty').fill('2');
            await investRow0.locator('.device-qty').dispatchEvent('change');
            await expect(investRow0.locator('.device-total')).toHaveValue('50,000');
            await expect(page.locator('#total-investment-cost')).toHaveValue('50,000');

            // 4. Check ROI Summary: (Total Benefit 110 KB - Invest 50 KB) / 1 Year = 60.00 KBath/Year (60,000 Bath/Year)
            await expect(page.locator('#roi-total-kb')).toContainText(
                '60.00 KBath/Year',
            );
            await expect(page.locator('#roi-total-full')).toContainText(
                '(60,000 Bath/Year)',
            );

            // Change ROI Payback Period to 2 Years -> 30.00 KBath/Year
            await page.locator('#req-roi-years').fill('2');
            await page.locator('#req-roi-years').dispatchEvent('change');
            await expect(page.locator('#roi-total-kb')).toContainText(
                '30.00 KBath/Year',
            );
            await expect(page.locator('#roi-total-year')).toContainText(
                'with in 2 Years',
            );

            // 5. Test "not improve manpower" & "not need more equipment" checkboxes
            await page.locator('#not-improve-manpower').check();
            await expect(page.locator('#table-labor tbody tr')).toHaveCount(0);
            await expect(page.locator('#add-row-labor')).toBeDisabled();

            await page.locator('#not-improve-investment').check();
            await expect(page.locator('#table-investment tbody tr')).toHaveCount(0);
            await expect(page.locator('#add-row-investment')).toBeDisabled();
        });

        test('should submit form data via POST /form/is/is-dev/create when Confirm is clicked', async ({
            page,
        }) => {
            let createRequestCalled = false;
            let postedBody = '';

            await page.route('**/form/is/is-dev/create', async (route) => {
                createRequestCalled = true;
                postedBody = route.request().postData() || '';
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: true, NRUNNO: 101 }),
                });
            });

            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/main?no=13&orgNo=050601&y=25&empno=24008`,
            );
            await expect(page.locator('#req-by-name')).toHaveText(
                MOCK_USERS['24008'].SNAME,
            );

            // Select Request Type 3 (Fixed Error Program) so ROI fields are not required
            await page.locator('input.request-type[value="3"]').click();

            await page.locator('input[name="program_name"]').fill('SCM System');
            await page.locator('input[name="title"]').fill('New Auto PO Module');
            const detailTextarea = page.locator('textarea[name="detail"]');
            await detailTextarea.fill('Automate purchase order creation.');
            await detailTextarea.dispatchEvent('keyup');

            // Attach a file to test setAttachments()
            await page
                .locator('.file-input-wrap input[type="file"]')
                .first()
                .setInputFiles({
                    name: 'workflow-diagram.pdf',
                    mimeType: 'application/pdf',
                    buffer: Buffer.from('dummy-pdf-content'),
                });

            const createResponsePromise = page.waitForResponse(
                '**/form/is/is-dev/create',
            );
            await page.locator('#confirm-form').click();
            const response = await createResponsePromise;

            expect(createRequestCalled).toBe(true);
            expect(response.status()).toBe(200);
            expect(postedBody).toContain('name="SYSTEMNAME"');
            expect(postedBody).toContain('SCM System');
            expect(postedBody).toContain('name="TITLE"');
            expect(postedBody).toContain('New Auto PO Module');
            expect(postedBody).toContain('name="REQ_ORG"');
            expect(postedBody).toContain('050604');
            expect(postedBody).toContain('filename="workflow-diagram.pdf"');
            expect(postedBody).toContain('dummy-pdf-content');
        });
    });

    test.describe('Show Mode: main() with NRUNNO and show()', () => {
        test('main() with runno!=0 should render show view and populate form data', async ({
            page,
        }) => {
            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/main?no=13&orgNo=050601&y=25&y2=${CURRENT_YEAR}&runno=101&empno=24008`,
            );

            await expect(page.locator('#form-data')).toBeVisible();
            await expect(page.locator('#NRUNNO')).toHaveValue('101');

            // Verify mapped data rendered from getFormIsDev()
            await expect(
                page.locator('.map-data[data-key="CATEGORY_NAME"]'),
            ).toHaveText('New Program/Additional Request');
            await expect(
                page.locator('.map-data[data-key="SYSTEMNAME"]'),
            ).toHaveText('Webflow System');
            await expect(page.locator('.map-data[data-key="TITLE"]')).toHaveText(
                'Automate IS-DEV Requisition Approval',
            );
            await expect(
                page.locator('.map-data[data-key="OBJECTIVE_TXT"]'),
            ).toHaveText('Cost Reduction');
            await expect(
                page.locator('.map-data[data-key="CURRENT_WORKFLOW"]'),
            ).toHaveText('Print paper form and sign manually');
            await expect(
                page.locator('.map-data[data-key="EXPECTED_WORKFLOW"]'),
            ).toHaveText('Submit and approve online via Webflow');

            // Verify newline in PURPOSE converted to <br>
            const purposeHtml = await page
                .locator('.map-data[data-key="PURPOSE"]')
                .innerHTML();
            expect(purposeHtml).toContain(
                'Line 1: Reduce manual paper routing<br>Line 2: Track status online',
            );
        });

        test('show() action should render show view with OBJECTIVE == 8 (Other Objective)', async ({
            page,
        }) => {
            // Override search mock to test OBJECTIVE == '8'
            await page.route('**/form/is/is-dev/search', async (route) => {
                const customData = [
                    {
                        ...MOCK_SHOW_DATA[0],
                        OBJECTIVE: '8',
                        OBJECTIVE_OTHER: 'Compliance & Security Audit',
                        objective: {
                            OBJ_ID: 8,
                            OBJ_NAME: 'Other',
                        },
                    },
                ];
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(customData),
                });
            });

            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/show?no=13&orgNo=050601&y=25&y2=${CURRENT_YEAR}&runno=101&empno=24008`,
            );

            await expect(page.locator('#form-data')).toBeVisible();
            await expect(
                page.locator('.map-data[data-key="OBJECTIVE_TXT"]'),
            ).toHaveText('Other: Compliance & Security Audit');
        });

        test('main() with draft status and EMPNO == INPUTBY should switch to Edit Mode (create view) and pre-fill form data', async ({
            page,
        }) => {
            let updateCalled = false;
            let updateBody = '';

            await page.route('**/form/is/is-dev/search', async (route) => {
                const draftData = [
                    {
                        ...MOCK_SHOW_DATA[0],
                        STATUS: '0',
                        INPUTBY: '24008',
                        REQBY: '12069',
                        JOBTYPE: '1',
                        ROI_RETURN: '2',
                        benefit: [
                            {
                                BENEFIT_TYPE: 0,
                                BENEFIT_CURRENT: 120,
                                BENEFIT_AFTER: 40,
                            },
                        ],
                        manhours: [
                            {
                                POSITION: '40',
                                COST: 500,
                                HOURS_PRESENT: 150,
                                HOURS_AFTER: 50,
                            },
                        ],
                        invest: [
                            {
                                DEVICE: 1,
                                QTY: 2,
                                PRICE: 25000,
                            },
                        ],
                    },
                ];
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(draftData),
                });
            });

            await page.route('**/form/is/is-dev/update', async (route) => {
                updateCalled = true;
                updateBody = route.request().postData() || '';
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ status: true, NRUNNO: 101 }),
                });
            });

            await page.goto(
                `${BASE_URL}/isform/IS-DEV/form/main?no=13&orgNo=050601&y=25&y2=${CURRENT_YEAR}&runno=101&empno=24008`,
            );

            // Should switch to Edit mode (#form-is-dev with #MODE = 2)
            await expect(page.locator('#form-is-dev')).toBeVisible();
            await expect(page.locator('#MODE')).toHaveValue('2');
            await expect(page.locator('#NRUNNO')).toHaveValue('101');

            // Verify pre-filled fields
            await expect(page.locator('#req-by-name')).toHaveText(
                MOCK_USERS['12069'].SNAME,
            );
            await expect(page.locator('#input-by-name')).toHaveText(
                MOCK_USERS['24008'].SNAME,
            );
            await expect(page.locator('input[name="program_name"]')).toHaveValue(
                'Webflow System',
            );
            await expect(page.locator('input[name="title"]')).toHaveValue(
                'Automate IS-DEV Requisition Approval',
            );
            await expect(page.locator('#req-roi-years')).toHaveValue('2');

            // Verify Save Draft in Edit Mode posts to /form/is/is-dev/update with STATUS=0
            const updateResponsePromise = page.waitForResponse(
                '**/form/is/is-dev/update',
            );
            await page.locator('#save-draft-form').click();
            const response = await updateResponsePromise;

            expect(updateCalled).toBe(true);
            expect(response.status()).toBe(200);
            expect(updateBody).toContain('name="STATUS"\r\n\r\n0');
            expect(updateBody).toContain('name="NRUNNO"\r\n\r\n101');
        });
    });
});

