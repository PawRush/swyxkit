# Production Deployment Checklist

Use this checklist to ensure your application is ready for production deployment to AWS Amplify.

## Pre-Deployment Planning

- [ ] Define production environment requirements
- [ ] Plan database backup strategy
- [ ] Identify custom domain name
- [ ] Plan monitoring and alerting
- [ ] Review security requirements
- [ ] Plan cost optimization

## Security Configuration

### Authentication
- [ ] Review Cognito password policy
- [ ] Enable MFA (optional but recommended)
- [ ] Configure email verification
- [ ] Set up forgot password flow
- [ ] Plan user migration strategy (if applicable)

### API Security
- [ ] Replace API key with Cognito authentication for sensitive operations
- [ ] Implement API rate limiting
- [ ] Configure CORS properly
- [ ] Enable WAF (Web Application Firewall) on AppSync
- [ ] Review authorization rules on all data models
- [ ] Audit IAM permissions

### Data Protection
- [ ] Enable DynamoDB encryption at rest
- [ ] Enable point-in-time recovery for DynamoDB
- [ ] Configure CloudTrail logging
- [ ] Set up S3 bucket policies (if using storage)
- [ ] Enable versioning on DynamoDB tables (via backups)

## Infrastructure Checklist

### AWS Resources
- [ ] Create AWS backup plan for DynamoDB
- [ ] Configure CloudWatch alarms for:
  - [ ] GraphQL API errors
  - [ ] DynamoDB throttling
  - [ ] Cognito failed authentications
- [ ] Set up CloudTrail for audit logging
- [ ] Configure VPC (if needed for private databases)
- [ ] Review AWS Budgets and Cost Alerts

### Frontend Deployment
- [ ] Build optimized production bundle: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Verify environment variables
- [ ] Check API endpoint is correct in `amplify_outputs.json`
- [ ] Test all authentication flows
- [ ] Verify all GraphQL queries work

## CI/CD Pipeline Setup

- [ ] Create GitHub repository (if not already done)
- [ ] Push all code including `amplify/` directory
- [ ] Create Amplify Console app
- [ ] Configure CI/CD environment variables
- [ ] Create `amplify.yml` configuration
- [ ] Set up build notifications
- [ ] Configure automatic deployments on merge
- [ ] Test manual deployment trigger

## Testing Checklist

### Functional Testing
- [ ] Test user sign-up flow
- [ ] Test user sign-in flow
- [ ] Test password reset
- [ ] Test email verification
- [ ] Test all GraphQL queries
- [ ] Test all GraphQL mutations
- [ ] Test real-time subscriptions
- [ ] Test error handling and messages

### Performance Testing
- [ ] Load test GraphQL API (100+ concurrent users)
- [ ] Monitor DynamoDB performance metrics
- [ ] Check CloudFront cache hit ratio
- [ ] Verify API response times < 200ms
- [ ] Test with various network speeds

### Security Testing
- [ ] SQL injection prevention
- [ ] XSS prevention in frontend
- [ ] CSRF protection
- [ ] Test unauthorized access attempts
- [ ] Verify authentication token expiration
- [ ] Test data isolation between users

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

## Monitoring and Logging

### CloudWatch Setup
- [ ] Create log groups for:
  - [ ] Lambda function logs
  - [ ] AppSync resolver logs
  - [ ] API Gateway logs
- [ ] Create dashboards for:
  - [ ] API response times
  - [ ] Error rates
  - [ ] Database throughput
  - [ ] Concurrent connections

### Alarms Configuration
```bash
# Example: API errors
aws cloudwatch put-metric-alarm \
  --alarm-name "AppSync-Errors" \
  --alarm-description "Alert when AppSync errors exceed 10 per minute" \
  --metric-name "Errors" \
  --namespace "AWS/AppSync" \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### X-Ray Tracing
- [ ] Enable X-Ray tracing on AppSync
- [ ] Enable X-Ray tracing on Lambda
- [ ] Review service map for performance bottlenecks
- [ ] Set up X-Ray alarms

## Custom Domain Setup

- [ ] Register domain or use existing domain
- [ ] Create hosted zone in Route 53
- [ ] Request ACM certificate for domain
- [ ] Create CloudFront distribution
- [ ] Configure Route 53 DNS records
- [ ] Test domain SSL/TLS

Example Route 53 setup:
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d123.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

## Performance Optimization

### Frontend
- [ ] Enable gzip compression
- [ ] Minify CSS and JavaScript
- [ ] Optimize images
- [ ] Enable code splitting
- [ ] Configure caching headers
- [ ] Use CDN for static assets

### Backend
- [ ] Optimize GraphQL queries
- [ ] Add database indexes
- [ ] Implement query caching
- [ ] Use DynamoDB Global Secondary Indexes
- [ ] Monitor and optimize Lambda cold starts

## Backup and Disaster Recovery

- [ ] Enable automatic DynamoDB backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Plan RTO (Recovery Time Objective): _____ minutes
- [ ] Plan RPO (Recovery Point Objective): _____ minutes
- [ ] Store critical secrets in AWS Secrets Manager

## Post-Deployment

### Monitoring (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify database performance
- [ ] Monitor infrastructure costs
- [ ] Review CloudWatch logs

### Ongoing Maintenance
- [ ] Weekly: Review CloudWatch metrics
- [ ] Weekly: Check error logs
- [ ] Monthly: Review cost trends
- [ ] Monthly: Security updates review
- [ ] Quarterly: Disaster recovery drill

## Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Document troubleshooting steps
- [ ] Create runbook for common issues
- [ ] Document access procedures
- [ ] Update team wiki/documentation

## Rollback Plan

- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Identify safe rollback points
- [ ] Prepare rollback communication
- [ ] Store previous version backups
- [ ] Set up quick rollback commands

## Stakeholder Communication

- [ ] Schedule launch meeting
- [ ] Prepare launch announcement
- [ ] Set up status page
- [ ] Prepare support documentation
- [ ] Brief support team
- [ ] Have on-call schedule ready

## Cost Optimization

- [ ] Review pricing tiers
- [ ] Analyze DynamoDB capacity
- [ ] Evaluate Lambda memory allocation
- [ ] Consider reserved capacity (if applicable)
- [ ] Set up AWS Budgets alerts
- [ ] Plan auto-scaling policies

## Compliance and Audit

- [ ] GDPR compliance (if applicable)
- [ ] HIPAA compliance (if applicable)
- [ ] SOC 2 compliance (if applicable)
- [ ] Data residency requirements
- [ ] Audit logging enabled
- [ ] Data retention policies defined

## Final Sign-Off

- [ ] Product team sign-off
- [ ] Security team sign-off
- [ ] Operations team sign-off
- [ ] Management approval
- [ ] Scheduled deployment time confirmed
- [ ] All stakeholders notified

---

## Production Deployment Commands

When ready to deploy to production:

```bash
# 1. Build the application
npm run build

# 2. Deploy backend infrastructure
npm run amplify:deploy

# 3. Deploy frontend (via Amplify Console or CI/CD)
# Push to main branch and let CI/CD handle it

# 4. Verify deployment
curl -X POST https://YOUR_PROD_ENDPOINT/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"query": "{ __schema { types { name } } }"}'

# 5. Monitor
aws cloudwatch get-dashboard --dashboard-name YourDashboard
```

---

**Last Updated:** January 8, 2026
**Deployment Date:** _____________
**Deployed By:** _____________
**Environment:** Production
