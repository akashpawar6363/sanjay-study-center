import { formatCurrency } from '@/lib/utils/formatters'
import { format } from 'date-fns'

export function getAdmissionReceiptTemplate({
  studentName,
  admissionNumber,
  receiptNumber,
  category,
  categoryFee,
  startDate,
  renewalDate,
  mobileNumber,
  paymentMode,
  digitalSignatureUrl,
  libraryName = 'Sanjay Study Center',
}: {
  studentName: string
  admissionNumber: string
  receiptNumber: string
  category: string
  categoryFee: number
  startDate: string
  renewalDate: string
  mobileNumber: string
  paymentMode: string
  digitalSignatureUrl?: string | null
  libraryName?: string
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admission Receipt</title>
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
    .receipt-info {
      background-color: #f8f9fa;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .receipt-info table {
      width: 100%;
      border-collapse: collapse;
    }
    .receipt-info td {
      padding: 8px 0;
    }
    .receipt-info td:first-child {
      font-weight: bold;
      width: 40%;
      color: #555;
    }
    .amount-box {
      background-color: #4F46E5;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    .amount-box .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .amount-box .amount {
      font-size: 32px;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .notice {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .notice strong {
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${libraryName}</h1>
    <p>Library Management System</p>
    <p><strong>ADMISSION RECEIPT</strong></p>
  </div>

  <div class="receipt-info">
    <table>
      <tr>
        <td>Receipt Number:</td>
        <td><strong>${receiptNumber}</strong></td>
      </tr>
      <tr>
        <td>Seat Number:</td>
        <td><strong>${admissionNumber}</strong></td>
      </tr>
      <tr>
        <td>Student Name:</td>
        <td>${studentName}</td>
      </tr>
      <tr>
        <td>Mobile Number:</td>
        <td>${mobileNumber}</td>
      </tr>
      <tr>
        <td>Category:</td>
        <td>${category}</td>
      </tr>
      <tr>
        <td>Start Date:</td>
        <td>${format(new Date(startDate), 'dd MMM yyyy')}</td>
      </tr>
      <tr>
        <td>Renewal Date:</td>
        <td>${format(new Date(renewalDate), 'dd MMM yyyy')}</td>
      </tr>
      <tr>
        <td>Payment Mode:</td>
        <td>${paymentMode}</td>
      </tr>
    </table>
  </div>

  <div class="amount-box">
    <div class="label">Amount Paid</div>
    <div class="amount">${formatCurrency(categoryFee)}</div>
  </div>

  <div class="notice">
    <strong>Important:</strong> Please renew your admission before ${format(new Date(renewalDate), 'dd MMM yyyy')} to continue using library services.
  </div>

  ${
    digitalSignatureUrl
      ? `
  <div style="margin-top: 30px; text-align: right;">
    <p style="margin-bottom: 5px; font-size: 14px; color: #666;">Authorized Signature</p>
    <img src="${digitalSignatureUrl}" alt="Digital Signature" style="max-width: 200px; height: auto; display: inline-block;" />
  </div>
  `
      : ''
  }

  <div class="footer">
    <p><strong>${libraryName}</strong></p>
    <p>Thank you for choosing us!</p>
    <p style="font-size: 12px; margin-top: 10px;">
      This is an automated email. Please do not reply to this message.
    </p>
  </div>
</body>
</html>
  `
}
