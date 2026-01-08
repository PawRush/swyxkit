# AWS Amplify Deployment Guide

## Current Deployment Status

✅ **Backend Deployed to AWS Amplify Sandbox**
✅ **Frontend Integrated with Amplify**
✅ **GraphQL API Active**

## AWS Resources

### Authentication (Cognito)
- **User Pool ID:** `us-east-1_5trQ00Nuo`
- **Client ID:** `58v6sehv4d8ugskj819jd2gben`
- **Identity Pool:** `us-east-1:32bae912-21c7-4bf3-876e-f8b67643f8cc`
- **Login Method:** Email
- **Region:** `us-east-1`

### GraphQL API (AppSync)
- **Endpoint:** `https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql`
- **API Key:** `da2-35wqvptwardgdldmxwcq7l3stq` (expires in 30 days)
- **Default Auth Type:** API_KEY (public access)
- **Supported Auth Types:**
  - API_KEY (public/sandbox)
  - AMAZON_COGNITO_USER_POOLS (authenticated users)
  - AWS_IAM (internal AWS services)

### Database (DynamoDB)
- **Tables:**
  - `BlogContent` - Blog post content (id, slug, title, description, content, timestamps)
  - `ContentList` - Content metadata (id, title, description, slug, date)
- **Billing Mode:** On-demand (pay per request)

## Development

### Local Sandbox Development
```bash
npm run amplify:sandbox
```
This runs the Amplify sandbox in watch mode, automatically syncing changes to your backend definition.

### Build and Test
```bash
npm run build
npm run preview
```

### Access GraphQL Schema
The GraphQL schema is available at the endpoint with introspection enabled. You can:
- Test queries at AWS AppSync console
- Use Apollo Studio with the endpoint
- Query with the API key for public access

## GraphQL Operations

### Query Blog Content
```graphql
query ListBlogContents {
  listBlogContents {
    items {
      id
      slug
      title
      description
      content
      createdAt
      updatedAt
    }
  }
}
```

### Query Single Blog Post
```graphql
query GetBlogContent($id: ID!) {
  getBlogContent(id: $id) {
    id
    slug
    title
    description
    content
    createdAt
    updatedAt
  }
}
```

## Production Deployment

### Prerequisites
1. GitHub repository with this code pushed
2. AWS credentials configured
3. GitHub Personal Access Token (for CI/CD)

### Option 1: Manual Production Deployment

```bash
# Deploy backend
npm run amplify:deploy

# Build and deploy frontend
npm run build
```

### Option 2: CI/CD Pipeline (Recommended)

1. **Create Amplify Console App:**
```bash
aws amplify create-app --name swyxkit-prod --repository github.com/YOUR_USERNAME/swyxkit --access-token YOUR_GITHUB_TOKEN
```

2. **Connect Branch:**
```bash
aws amplify create-branch --app-id YOUR_APP_ID --branch-name main
```

3. **Add Backend Deployment Role:**
```bash
aws iam create-role --role-name AmplifyBackendRoleProd \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"amplify.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy --role-name AmplifyBackendRoleProd \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess

aws amplify update-app --app-id YOUR_APP_ID \
  --iam-service-role-arn arn:aws:iam::ACCOUNT_ID:role/AmplifyBackendRoleProd
```

4. **Create amplify.yml in project root:**
```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx @aws-amplify/backend@latest deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - node_modules/**/*
```

5. **Push changes and trigger deployment:**
```bash
git add amplify.yml
git commit -m "Add Amplify CI/CD configuration"
git push origin main
```

## Connecting Frontend to Backend

The frontend is already configured to connect to your Amplify backend. The `amplify_outputs.json` file contains all necessary credentials and endpoints.

### Using GraphQL in Components

```svelte
<script>
  import { generateClient } from 'aws-amplify/api';
  import { listBlogContents } from './graphql/queries';

  const client = generateClient();

  async function getPosts() {
    const result = await client.graphql({
      query: listBlogContents,
    });
    return result.data.listBlogContents.items;
  }
</script>
```

## Environment Variables

The following sensitive values are stored in `amplify_outputs.json` (generated):
- Cognito User Pool ID
- Cognito Client ID
- Cognito Identity Pool ID
- AppSync API Endpoint
- API Key

These are automatically loaded when Amplify initializes.

## Security Notes

⚠️ **API Key Security:**
- The current API key (`da2-35wqvptwardgdldmxwcq7l3stq`) expires in 30 days
- For production, rotate API keys regularly
- Consider using Cognito authentication instead of API keys for sensitive operations

⚠️ **Credentials:**
- `amplify_outputs.json` is gitignored and never committed
- AWS credentials are stored in `~/.aws/credentials`
- Never commit sensitive credentials to version control

## Troubleshooting

### GraphQL API Connection Failed
1. Verify API endpoint is correct in `amplify_outputs.json`
2. Check API key hasn't expired
3. Verify AWS credentials are configured: `aws sts get-caller-identity`

### Authentication Not Working
1. Ensure Cognito User Pool ID is correct
2. Verify Amplify is initialized before auth operations
3. Check browser console for error messages

### Backend Changes Not Syncing
1. Ensure `npm run amplify:sandbox` is running
2. Verify changes are in `amplify/` directory
3. Check for TypeScript compilation errors

## Useful Commands

```bash
# View CloudFormation stack
aws cloudformation describe-stacks --stack-name amplify-swyxkit-jairosp-sandbox-8e2f415dc8

# List DynamoDB tables
aws dynamodb list-tables

# Query User Pool
aws cognito-idp describe-user-pool --user-pool-id us-east-1_5trQ00Nuo

# Check AppSync API
aws appsync get-graphql-api --api-id 3idu3v3qnzg2zfirxfxzz622la
```

## Next Steps

1. **Test the GraphQL API** with sample queries
2. **Set up CI/CD pipeline** for automated deployments
3. **Configure custom domain** for production URL
4. **Enable additional features:**
   - File storage (S3)
   - Lambda functions
   - Real-time subscriptions
5. **Implement authentication UI** in your app
6. **Set up monitoring** with CloudWatch

## Support Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AppSync Developer Guide](https://docs.aws.amazon.com/appsync/latest/devguide/)
- [SvelteKit Deployment Guide](https://kit.svelte.dev/docs/adapter-node)
- [Cognito User Pool Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/)
