<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request for User-ID and Authorization Regular Review of FY2025</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            /* background: #f7f8fa; */
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 700px;
            margin: 40px auto;
            background: #fff;
            box-shadow: 0 2px 8px #e0e0e0;
            border-radius: 8px;
            padding: 32px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .header-info {
            font-size: 16px;
        }

        .header-table {
            border: 1px solid #888;
            width: 120px;
            height: 70px;
            text-align: center;
        }

        .title {
            text-align: center;
            font-weight: bold;
            color: #35608f;
            font-size: 20px;
            margin: 32px 0 24px;
        }

        .section-title {
            color: #35608f;
            font-weight: bold;
            margin-top: 24px;
        }

        ul {
            margin: 8px 0 8px 24px;
        }

        .strike {
            text-decoration: line-through;
            color: #d00;
        }

        .important {
            color: #d00;
            font-weight: bold;
        }

        .contact {
            margin-top: 32px;
            font-size: 15px;
        }

        a {
            color: #35608f;
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <!-- <div class="header-info"> -->
            <!-- <div><strong>&#9654; Date:</strong> 27-Aug-2025</div> -->
            <!-- <div><strong>To:</strong> MFG DIM, <span style="text-decoration:underline; color:#35608f;">BP DIM</span> , RAF DIM</div> -->
            <!-- <div><strong>From:</strong> IS Dept</div> -->
            <!-- </div> -->
        </div>
        <div class="title">Request for "User-ID and Authorization Regular Review of FY<?= date('Y') ?>"</div>
        <div style="margin-bottom: 16px;">
            <p>According to “AMEC RULE-3501 Rule for Information System Security” and “IT General Control (ITGC)” need to review about User-ID and Authorization regularly.<br>
                Each resource owner need to review users and authorized for ensure that appropriate right have been assigned to the correct person.</p>
        </div>
        <div class="section-title">Request</div>
        <ul>
            <li>Please confirm User ID and Authorized from concern system , input checking result in “Report of User ID and Authorization regular review” and approval.</li>
        </ul>
        <div class="section-title">Schedule</div>
        <ul>
            <!-- <li class="strike">User ID and Authorization Regular Review (hard copy) will be sent by Aug 27<sup>th</sup>, 2025</li> -->
            <?php
            $dueDate = date('M j, Y', strtotime('+15 days'));
            ?>
            <li>
                Please submit “User-ID and Authorization Regular Review” form on <span class="important">webflow</span> to IS Dept by <span class="important"><?= $dueDate ?></span>.
            </li>
        </ul>
        <div class="section-title">Your Forms</div>
        <ul>

            <li>Total forms: <strong><?= isset($BODY['form_count']) ? $BODY['form_count'] : 0 ?></strong></li>
            <?php if (!empty($BODY['form_numbers'])): ?>
                <?php foreach ($BODY['form_numbers'] as $i => $num): ?>
                    <?php
                    $f = isset($BODY['forms'][$i]) ? $BODY['forms'][$i] : null;
                    // print_r($BODY);
                    if ($f) {
                        $url = base_url('isform/IS-RGV/main/?no=' . urlencode($f['nfrmno']) . '&orgNo=' . urlencode($f['vorgno']) . '&y=' . urlencode($f['cyear']) . '&y2=' . urlencode($f['cyear2']) . '&runNo=' . urlencode($f['nrunno']) . '&empno=' . urlencode($BODY['pic']));
                    } else {
                        $url = '#';
                    }
                    ?>
                    <li>Form Number: <span style="color:#35608f; font-weight:bold;"> <?= htmlspecialchars($num) ?> </span></li>
                <?php endforeach; ?>
            <?php endif; ?>
        </ul>
        </ul>
        <div class="section-title">Contact</div>
        <div class="contact">
            Should you have any question, please contact IS Department at<br>
            <!-- <a href="mailto:phannee@MitsubishiElevatorAsia.co.th">phannee@MitsubishiElevatorAsia.co.th(2044)</a> , -->
            <a href="mailto:Tirarat@MitsubishiElevatorAsia.co.th">Tirarat@MitsubishiElevatorAsia.co.th(2026)</a>
        </div>
        <div style="margin-top:24px; font-size:15px; text-align:left; color:#35608f; font-weight:bold;">Thank you,<br>IS Dept</div>
    </div>
</body>

</html>