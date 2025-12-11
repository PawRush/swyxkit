# CI/CD Pipeline Setup Guide

## Quick Start

This guide walks you through setting up the GitHub Actions CI/CD pipeline for automatic AWS deployments.

## Prerequisites

- AWS Account (existing or new)
- GitHub repository with admin access
- AWS CLI configured locally
- Node.js 18+

## Step 1: AWS IAM Setup

### Create OIDC Provider (One-time)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### Create IAM Role for GitHub Actions

1. Create a trust policy file (`trust-policy.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/swyxkit:*",
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

2. Replace `YOUR_ACCOUNT_ID` and `YOUR_GITHUB_ORG` with your actual values

3. Create the role:

```bash
aws iam create-role \
  --role-name github-actions-swyxkit \
  --assume-role-policy-document file://trust-policy.json
```

4. Attach permissions policy:

```bash
aws iam put-role-policy \
  --role-name github-actions-swyxkit \
  --policy-name github-actions-policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "cloudformation:*",
          "s3:*",
          "s3-outposts:*",
          "cloudfront:*",
          "iam:*",
          "logs:*",
          "lambda:*",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSecurityGroupReferences",
          "ec2:DescribeNetworkInterfaces"
        ],
        "Resource": "*"
      }
    ]
  }'
```

5. Get the role ARN:

```bash
aws iam get-role --role-name github-actions-swyxkit --query 'Role.Arn' --output text
```

Note this ARN for the next step.

## Step 2: GitHub Secrets Configuration

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Create the following secrets:

### Required Secrets:

#### `AWS_ROLE_TO_ASSUME`
- **Value:** The ARN from Step 1 (e.g., `arn:aws:iam::376058330285:role/github-actions-swyxkit`)
- **Description:** IAM role ARN for GitHub Actions OIDC

#### `AWS_ACCOUNT_ID`
- **Value:** Your AWS Account ID (e.g., `376058330285`)
- **Description:** AWS Account ID for CDK deployments

## Step 3: Pipeline Execution

### First Deployment

1. Ensure your code is committed to the repository
2. Push to the `main` branch:

```bash
git push origin main
```

3. Monitor the deployment in GitHub Actions:
   - Go to your repository → **Actions**
   - Click on the **Build, Test, and Deploy to AWS** workflow
   - Watch the deployment progress

4. Once complete, the deployment summary will show:
   - Website URL (CloudFront distribution)
   - Distribution ID
   - AWS region

### Preview Deployments

Preview deployments are automatically created for pull requests:

1. Create a pull request to `main`
2. The pipeline will:
   - Build and test your code
   - Deploy a preview environment
   - Post a comment with the preview URL

3. Preview environments are named: `SwyxkitFrontend-preview-{username}`

## Step 4: Update Deployment Plan

Update `deployment_plan.md` with the production deployment URL:

```yaml
Frontend URL: https://your-cloudfront-domain.cloudfront.net
```

## Verification

### Test Build Locally

```bash
npm install --legacy-peer-deps
npm run build
npm run lint
npm run check
npm run test
```

### Test CDK Deployment Locally

```bash
cd infra
npm install --legacy-peer-deps
npm run build
npx cdk synth --context environment=test
```

### Check Pipeline Status

- GitHub Actions dashboard: `https://github.com/YOUR_ORG/swyxkit/actions`
- Workflow file: `.github/workflows/deploy-to-aws.yml`

## Troubleshooting

### Build Fails

**Issue:** Lint or type errors

**Solution:**
```bash
npm run lint
npm run check
# Fix errors locally, commit, and push
```

### Deployment Fails

**Issue:** "Access Denied" or permission errors

**Solution:**
1. Verify IAM role permissions
2. Check GitHub secrets are configured correctly
3. Ensure OIDC provider is created in AWS

**Issue:** "Stack already exists"

**Solution:**
- Previous deployment may still be in progress
- Check AWS CloudFormation console
- Wait for current deployment to complete

### Preview URL Not Posted

**Issue:** PR comment not appearing

**Solution:**
1. Verify permissions in IAM policy
2. Check workflow logs for errors
3. Ensure `github.rest.issues.createComment` permission is set

## Advanced Configuration

### Custom AWS Region

Edit `.github/workflows/deploy-to-aws.yml` and change:

```yaml
env:
  AWS_REGION: us-east-1  # Change this
```

### Custom Stack Names

Edit `infra/bin/infra.ts` to use custom stack naming:

```typescript
new FrontendStack(app, `CustomName-${environment}`, {
  // ...
});
```

### Additional Environments

Create separate workflow files for different environments:
- `deploy-staging.yml` for staging deployments
- `deploy-prod.yml` for production deployments

## Next Steps

1. ✅ Configure GitHub secrets
2. ✅ Set up AWS IAM role
3. ✅ Push to `main` to trigger first deployment
4. ✅ Monitor deployment in GitHub Actions
5. ✅ Test preview deployments with a pull request

## Support

For issues or questions:
- Check [CI/CD Pipeline Documentation](./CI_CD_PIPELINE.md)
- Review [GitHub Actions Documentation](https://docs.github.com/en/actions)
- Check AWS CloudFormation events in AWS Console
