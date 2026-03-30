<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $SUBJECT ?? 'Dispatch Notification' }}</title>
</head>

<body style="font-family: Arial, Helvetica, sans-serif; background:#f5f6fa; padding:20px;">

<div style="max-width:700px; margin:auto; background:#ffffff; border-radius:8px; border:1px solid #ddd;">

    <!-- HEADER -->
    <div style="background:#0f766e; color:#fff; padding:16px 20px;">
        <h3 style="margin:0;">🚐 Transportation Notification</h3>
    </div>

    <!-- BODY -->
    <div style="padding:20px; font-size:14px; color:#333; line-height:1.6;">

        <!-- Greeting -->
        <div style="margin-bottom:15px;">
            Dear All,
        </div>

        <!-- Main Message -->
        <div style="margin-bottom:10px;">
            This email is to inform the transportation arrangement for today.
        </div>

        <!-- Info -->
        <div style="margin-bottom:15px;">
            <strong>Date:</strong> {{ $DATE ?? '-' }} <br>
            <strong>Time:</strong> {{ $TIME ?? '-' }}
        </div>

        <!-- Description -->
        <div style="margin-bottom:15px;">
            Please check the attached files for:
            <ul style="margin-top:8px;">
                <li>Bus route and passenger list</li>
                <li>List of employees without transportation</li>
            </ul>
        </div>

        <!-- Custom BODY (optional) -->
        @if(!empty($BODY) && is_array($BODY))
            @foreach($BODY as $row)
                <div style="margin-bottom:8px;">
                    {!! $row !!}
                </div>
            @endforeach
        @endif

        <!-- Attachment note -->
        @if(!empty($ENFILE))
        <div style="margin-top:15px;">
            <strong>📎 Attachments:</strong>
            <ul>
                @foreach($ENFILE as $file)
                    <li>{{ $file }}</li>
                @endforeach
            </ul>
        </div>
        @endif

        <!-- Footer message -->
        <div style="margin-top:20px;">
            Thank you.
        </div>

    </div>

    <!-- FOOTER -->
    <div style="background:#f1f2f6; padding:12px; font-size:12px; text-align:center;">
        🚐 หากมีปัญหาหรือข้อสงสัยเพื่มเติม ติดต่อคุณณัฐวุฒิ วิจิตร (อาร์ม) Tel:1124 🚐
    </div>

</div>

</body>
</html>