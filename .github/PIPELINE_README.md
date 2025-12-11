# Build, Test, and Deploy to AWS

**Pipeline Name:** `Build, Test, and Deploy to AWS`

## Quick Reference

This GitHub Actions workflow automatically builds, tests, and deploys the SwyxKit application to AWS.

### Workflow File
- Location: `.github/workflows/deploy-to-aws.yml`
- Trigger: Push to `main`/`deploy-to-aws` or PR to `main`

### Three Jobs

1. **build-and-test** ✅
   - Runs on all events
   - Builds, lints, type-checks, and tests the app
   - Uploads build artifacts

2. **deploy-to-aws** 🚀
   - Production deployment
   - Trigger: Push to `main`
   - Environment: `prod`
   - Includes cache invalidation

3. **deploy-preview** 👀
   - Preview deployment
   - Trigger: Pull request to `main`
   - Environment: `preview-{username}`
   - Posts preview URL as PR comment

### Required Configuration

See [CICD_SETUP.md](../../docs/CICD_SETUP.md) for complete setup instructions.

**Quick checklist:**
- [ ] AWS IAM role created
- [ ] OIDC provider configured
- [ ] GitHub secrets set: `AWS_ROLE_TO_ASSUME`, `AWS_ACCOUNT_ID`
- [ ] Push to `main` to trigger first deployment

### Deployment URLs

- **Production:** `https://d1i6a6yndiq204.cloudfront.net`
- **Preview:** Posted as PR comment

### Useful Commands

```bash
# View workflow runs
gh run list --workflow deploy-to-aws.yml

# View specific run details
gh run view RUN_ID --log

# Manually trigger workflow
gh workflow run deploy-to-aws.yml -r main
```

### Documentation

- [CI/CD Pipeline Documentation](../../docs/CI_CD_PIPELINE.md) - Full reference
- [Setup Guide](../../docs/CICD_SETUP.md) - Step-by-step configuration
- [Deployment Plan](../../deployment_plan.md) - Deployment details

### Troubleshooting

**Build fails?**
```bash
npm run lint
npm run check
npm run build
```

**Deployment fails?**
- Check GitHub secrets
- Verify IAM role and OIDC configuration
- Review CloudFormation events in AWS Console

**Need to rollback?**
```bash
git revert <commit>
git push origin main
```

### Support

For detailed information, see:
1. GitHub Actions logs (Actions tab in repository)
2. AWS CloudFormation events
3. [CI/CD Pipeline Documentation](../../docs/CI_CD_PIPELINE.md)
