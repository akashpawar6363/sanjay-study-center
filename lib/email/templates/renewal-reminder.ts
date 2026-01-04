import { formatCurrency } from '@/lib/utils/formatters'
import { format } from 'date-fns'

export function getRenewalReminderTemplate({
  studentName,
  admissionNumber,
  category,
  categoryFee,
  renewalDate,
  daysRemaining,
  libraryName = 'Sanjay Study Center',
}: {
  studentName: string
  admissionNumber: string
  category: string
  categoryFee: number
  renewalDate: string
  daysRemaining: number
  libraryName?: string
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Renewal Reminder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #4F46E5;
    }
    .header h1 {
      margin: 0;
      color: #4F46E5;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .alert-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-box h2 {
      color: #856404;
      margin-top: 0;
      font-size: 20px;
    }
    .alert-box p {
      margin: 10px 0;
      color: #856404;
    }
    .info-box {
      background-color: #f8f9fa;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-box table {
      width: 100%;
      border-collapse: collapse;
    }
    .info-box td {
      padding: 8px 0;
    }
    .info-box td:first-child {
      font-weight: bold;
      width: 40%;
      color: #555;
    }
    .cta-button {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button a {
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${libraryName}</h1>
    <p>Library Management System</p>
  </div>

  <div class="alert-box">
    <h2>🔔 Renewal Reminder</h2>
    <p>Dear ${studentName},</p>
    <p>
      Your library admission is expiring in <strong>${daysRemaining} days</strong>. 
      Please renew your admission to continue enjoying our services.
    </p>
  </div>

  <div class="info-box">
    <table>
      <tr>
        <td>Admission Number:</td>
        <td><strong>${admissionNumber}</strong></td>
      </tr>
      <tr>
        <td>Category:</td>
        <td>${category}</td>
      </tr>
      <tr>
        <td>Renewal Date:</td>
        <td><strong style="color: #dc2626;">${format(new Date(renewalDate), 'dd MMM yyyy')}</strong></td>
      </tr>
      <tr>
        <td>Renewal Fee:</td>
        <td><strong>${formatCurrency(categoryFee)}</strong></td>
      </tr>
    </table>
  </div>

  <div class="cta-button">
    <a href="#">Renew Now</a>
  </div>

  <div class="footer">
    <p><strong>${libraryName}</strong></p>
    <p>For any queries, please contact the library administrator.</p>
    <p style="font-size: 12px; margin-top: 10px;">
      This is an automated reminder. Please do not reply to this message.
    </p>
  </div>
</body>
</html>
  `
}
