# Email System Configuration Guide

## Overview
The Sanjay Study Center application includes automated email functionality for sending admission receipts and renewal reminders.

## Prerequisites
- Gmail account with 2-Step Verification enabled
- Gmail App Password generated

## Gmail Setup

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the prompts to enable it

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other" as the device and name it "Sanjay Study Center"
4. Click "Generate"
5. Copy the 16-character password (remove spaces)

### Step 3: Configure Environment Variables
Add these to your `.env.local` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_NAME=Sanjay Study Center
```

## Email Features

### 1. Admission Receipt Email
**When**: Automatically sent when a new admission is created  
**To**: Student's email address  
**Content**:
- Receipt number and admission number
- Student details (name, mobile, category)
- Amount paid and payment mode
- Start date and renewal date
- Professional HTML template

### 2. Renewal Reminder Email
**When**: Sent 2 days before admission expiry  
**To**: Student's email address  
**Content**:
- Days remaining until expiry
- Admission details
- Renewal fee amount
- Call-to-action button
- Professional HTML template

## Testing Emails Locally

### Test Admission Receipt
1. Start development server: `npm run dev`
2. Create a new admission with a valid email
3. Check the email inbox (and spam folder)

### Test Renewal Reminder Manually
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "admissionId": "your-admission-id",
    "type": "reminder"
  }'
```

### Test Automated Cron Job
```bash
curl -X GET http://localhost:3000/api/cron/renewal-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

## Automated Renewal Reminders

### Scheduling Options

#### Option 1: Vercel Cron Jobs
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/renewal-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Option 2: GitHub Actions
Create `.github/workflows/cron.yml`:
```yaml
name: Daily Renewal Reminders
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call renewal reminders
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/renewal-reminders
```

#### Option 3: cron-job.org
1. Create account at https://cron-job.org
2. Add new cron job:
   - **URL**: `https://your-domain.com/api/cron/renewal-reminders`
   - **Schedule**: `0 9 * * *` (9 AM daily)
   - **Headers**: `Authorization: Bearer your-cron-secret`

## Email Logs

All sent emails are logged in the `email_logs` table:

```sql
SELECT * FROM email_logs
ORDER BY created_at DESC
LIMIT 10;
```

Columns:
- `admission_id`: Related admission
- `email_type`: 'receipt' or 'reminder'
- `recipient`: Email address
- `subject`: Email subject
- `status`: 'sent' or 'failed'
- `created_at`: Timestamp

## Troubleshooting

### Emails Not Sending

#### 1. Check Gmail Credentials
```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

#### 2. Check Email Logs
```sql
-- View failed emails
SELECT * FROM email_logs
WHERE status = 'failed'
ORDER BY created_at DESC;
```

#### 3. Check Server Logs
- Vercel: Check Function Logs in dashboard
- Local: Check terminal output

#### 4. Common Issues
- **"Invalid login"**: App password is incorrect
- **"Connection timeout"**: Firewall blocking port 587
- **"Quota exceeded"**: Gmail sending limit reached (500/day)
- **Rate limiting**: Add delay between emails in cron job

### Testing SMTP Configuration

Create `test-email.js`:
```javascript
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email'
}).then(info => {
  console.log('Email sent:', info.messageId);
}).catch(error => {
  console.error('Error:', error);
});
```

Run: `node test-email.js`

## Gmail Sending Limits

| Account Type | Daily Limit |
|-------------|-------------|
| Free Gmail | 500 emails/day |
| Google Workspace | 2,000 emails/day |

If you exceed limits:
- Use a Google Workspace account
- Use a dedicated email service (SendGrid, AWS SES)
- Implement email queueing

## Alternative SMTP Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

## Security Best Practices

1. **Never commit credentials** - Keep `.env.local` in `.gitignore`
2. **Use app passwords** - Don't use your actual Gmail password
3. **Rotate secrets** - Change `CRON_SECRET` periodically
4. **Monitor logs** - Check for suspicious activity
5. **Rate limiting** - Implement sending delays
6. **Validate emails** - Check email format before sending
7. **Unsubscribe option** - Add to reminder emails (future)

## Production Checklist

- [ ] Gmail App Password configured
- [ ] Environment variables set in hosting platform
- [ ] CRON_SECRET added to environment
- [ ] Cron job scheduled (Vercel/GitHub Actions/External)
- [ ] Test email sending in production
- [ ] Monitor email_logs table
- [ ] Set up error alerts
- [ ] Configure backup SMTP provider

## Email Templates Customization

Templates are located in:
- `lib/email/templates/admission-receipt.ts`
- `lib/email/templates/renewal-reminder.ts`

To customize:
1. Edit HTML content
2. Update styling in `<style>` tag
3. Test locally before deploying
4. Ensure responsive design for mobile

## Monitoring & Analytics

### Daily Checks
```sql
-- Emails sent today
SELECT COUNT(*) FROM email_logs
WHERE DATE(created_at) = CURRENT_DATE;

-- Failed emails today
SELECT * FROM email_logs
WHERE DATE(created_at) = CURRENT_DATE
AND status = 'failed';
```

### Weekly Report
```sql
-- Email statistics for last 7 days
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY email_type, status;
```

---

**Last Updated**: December 2024
