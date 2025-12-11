# CI/CD Pipeline Documentation

## Overview

The SwyxKit project uses GitHub Actions for continuous integration and continuous deployment to AWS. The pipeline handles building, testing, and deploying the application to AWS S3 and CloudFront.

**Pipeline Name:** `Build, Test, and Deploy to AWS`

## Workflows

### 1. Build, Test, and Deploy to AWS (`.github/workflows/deploy-to-aws.yml`)

This is the main CI/CD workflow that runs on pushes to `main` and `deploy-to-aws` branches, as well as on pull requests.

#### Jobs

##### `build-and-test` - Runs on all events
- **Trigger:** Pushes to `main` or `deploy-to-aws`, or pull requests to `main`
- **Runs on:** `ubuntu-latest`
- **Steps:**
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Run ESLint and Prettier checks
  5. Type checking with `svelte-check`
  6. Build the SvelteKit application
  7. Run tests with Playwright
  8. Upload build artifacts

##### `deploy-to-aws` - Production deployment
- **Trigger:** Push to `main` branch only
- **Depends on:** `build-and-test`
- **Runs on:** `ubuntu-latest`
- **Environment:** Production (`prod`)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 18
  3. Configure AWS credentials (OIDC)
  4. Install dependencies
  5. Build frontend
  6. Install CDK dependencies
  7. Bootstrap CDK (idempotent)
  8. Deploy to AWS using CDK
  9. Retrieve deployment outputs
  10. Invalidate CloudFront cache
  11. Post deployment summary to GitHub

##### `deploy-preview` - Preview deployment
- **Trigger:** Pull request to `main`
- **Depends on:** `build-and-test`
- **Runs on:** `ubuntu-latest`
- **Environment:** Preview (`preview-{github-username}`)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 18
  3. Configure AWS credentials (OIDC)
  4. Install dependencies
  5. Build frontend
  6. Install CDK dependencies
  7. Bootstrap CDK (idempotent)
  8. Deploy preview to AWS (with hotswap)
  9. Retrieve preview deployment outputs
  10. Post preview URL as PR comment

## Configuration Requirements

### GitHub Secrets

The following secrets must be configured in your GitHub repository settings:

1. **`AWS_ROLE_TO_ASSUME`** - ARN of the IAM role for OIDC
   - Example: `arn:aws:iam::376058330285:role/github-actions-role`
   - Uses OIDC token for secure, keyless authentication

2. **`AWS_ACCOUNT_ID`** - AWS Account ID
   - Example: `376058330285`

### GitHub Environments

Optionally, create GitHub Environments for better control:

- **`production`** - For production deployments
- **`preview`** - For preview deployments

### AWS IAM Setup

Create an IAM role that GitHub Actions will assume. The role must have permissions for:

- CloudFormation (create, update, delete stacks)
- S3 (create, delete buckets, upload objects)
- CloudFront (create, update distributions, create invalidations)
- IAM (create roles, policies)
- Logs (create log groups)

**Example IAM policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "cloudfront:*",
        "iam:*",
        "logs:*",
        "lambda:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### OIDC Provider Setup

1. Create an OIDC provider in AWS IAM:
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   ```

2. Create an IAM role that trusts the OIDC provider:
   ```bash
   aws iam create-role \
     --role-name github-actions-role \
     --assume-role-policy-document file://trust-policy.json
   ```

## Environment Variables

### Main Environment

- `AWS_REGION` - Set to `us-east-1`
- `CDK_ENVIRONMENT` - Set to `prod` for production

### Production Deployment

- Uses environment: `prod`
- Stack name: `SwyxkitFrontend-prod`

### Preview Deployment

- Uses environment: `preview-{github-username}`
- Stack name: `SwyxkitFrontend-preview-{github-username}`
- Uses hotswap deployment for faster feedback

## Workflow Execution

### Automatic Triggers

1. **Push to `main`** → Builds, tests, and deploys to production
2. **Push to `deploy-to-aws`** → Builds and tests only
3. **Pull Request to `main`** → Builds, tests, and deploys preview

### Manual Triggers

Workflows can be triggered manually from the GitHub Actions tab.

## Build Output

### Build Artifacts

The build process generates:
- `build-output` artifact containing `.svelte-kit/output/client/`
- Stored for 1 day for debugging

### Deployment Outputs

After deployment, the workflow retrieves and displays:
- **Website URL** - CloudFront distribution URL
- **Distribution ID** - CloudFront distribution ID
- **Region** - AWS region

## Deployment Summary

A deployment summary is posted to GitHub Actions for each deployment, containing:
- Environment (prod/preview)
- Website URL
- Distribution ID
- AWS region

### Preview Deployment Comments

For pull requests, a comment is automatically posted with:
- Preview URL
- Environment name
- AWS region

## Cache Invalidation

After each production deployment, the CloudFront cache is invalidated with `/*` path to ensure fresh content is served.

## Rollback

To rollback a deployment:

1. Revert the commit in the main branch
2. Push the revert commit
3. The pipeline will redeploy with the previous version

## Cleanup

### Preview Deployments

Preview stacks created from PR deployments remain in AWS. To clean up:

```bash
# List preview stacks
aws cloudformation list-stacks --region us-east-1 | grep SwyxkitFrontend-preview

# Delete a preview stack
aws cloudformation delete-stack --stack-name SwyxkitFrontend-preview-username --region us-east-1
```

### Manual Cleanup

```bash
# In the infra directory
cd infra
npx cdk destroy SwyxkitFrontend-{environment} --force
```

## Troubleshooting

### Build Failures

1. Check the build logs in GitHub Actions
2. Look for lint/type errors: `npm run lint` and `npm run check`
3. Check for test failures: `npm run test`

### Deployment Failures

1. Verify AWS credentials and IAM permissions
2. Check CDK bootstrap status: ensure bootstrap is current
3. Review CloudFormation events in AWS Console
4. Check for resource naming conflicts

### Permission Errors

1. Ensure IAM role has correct permissions
2. Verify OIDC trust relationship in IAM role
3. Check GitHub repository settings for secret configuration

## Next Steps

1. Configure GitHub repository secrets
2. Set up AWS OIDC provider
3. Create IAM role for GitHub Actions
4. Push to `main` branch to trigger first deployment

## Related Documentation

- [CDK Infrastructure](../infra/README.md)
- [Deployment Plan](../deployment_plan.md)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
