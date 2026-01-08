# Quick Start Guide - AWS Amplify Deployment

Your SvelteKit application is now deployed to AWS Amplify! This guide will help you get started quickly.

## 🚀 What's Ready

✅ **AWS Backend Services**
- Cognito User Pool for authentication
- AppSync GraphQL API
- DynamoDB databases
- Real-time subscriptions

✅ **Frontend Integration**
- SvelteKit fully configured
- Amplify client ready to use
- Environment configured

✅ **Documentation**
- Full API reference
- Deployment guide
- Production checklist
- This quick start

## 📋 Essential Information

| Item | Value |
|------|-------|
| **GraphQL Endpoint** | `https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql` |
| **API Key** | `da2-35wqvptwardgdldmxwcq7l3stq` |
| **Cognito Pool** | `us-east-1_5trQ00Nuo` |
| **Region** | `us-east-1` |

## 🏃 5-Minute Setup

### 1. Start Development Server

```bash
# Terminal 1: Start Amplify backend in watch mode
npm run amplify:sandbox

# Terminal 2: Start frontend dev server
npm run dev
```

Visit `http://localhost:5173` to see your app.

### 2. Test GraphQL API

Open another terminal and test the API:

```bash
curl -X POST https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: da2-35wqvptwardgdldmxwcq7l3stq" \
  -d '{
    "query": "query { listBlogContents { items { id title slug } } }"
  }'
```

### 3. Query from Frontend

In a Svelte component:

```svelte
<script>
  import { generateClient } from 'aws-amplify/api';
  import { listBlogContents } from './graphql/queries';

  const client = generateClient();

  async function getPosts() {
    try {
      const result = await client.graphql({
        query: listBlogContents,
      });
      console.log('Posts:', result.data.listBlogContents.items);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  getPosts();
</script>

<button on:click={getPosts}>Refresh Posts</button>
```

## 📚 Important Files to Know

```
swyxkit/
├── amplify/                    # Backend configuration
│   ├── backend.ts             # Main config
│   ├── auth/resource.ts       # Authentication
│   └── data/resource.ts       # Data models & GraphQL schema
├── amplify_outputs.json       # Generated (gitignored) - contains credentials
├── DEPLOYMENT.md              # Full deployment guide
├── API_REFERENCE.md           # GraphQL API documentation
├── PRODUCTION_CHECKLIST.md    # Production readiness checklist
└── src/
    └── routes/
        └── +layout.svelte     # Amplify initialization here
```

## 🔐 Authentication

### Enable Sign-In

The Cognito integration is already configured. Add this to your component:

```svelte
<script>
  import { signIn, signUp, signOut, getCurrentUser } from 'aws-amplify/auth';

  let user = null;

  async function handleSignIn() {
    try {
      const result = await signIn({
        username: 'user@example.com',
        password: 'Password123!'
      });
      user = result;
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }

  async function handleSignUp() {
    try {
      const result = await signUp({
        username: 'newuser@example.com',
        password: 'Password123!',
        attributes: {
          email: 'newuser@example.com'
        }
      });
      console.log('Sign up successful:', result);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      user = null;
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Check current user on mount
  onMount(async () => {
    try {
      user = await getCurrentUser();
    } catch (error) {
      console.log('No user signed in');
    }
  });
</script>

{#if user}
  <p>Welcome, {user.username}!</p>
  <button on:click={handleSignOut}>Sign Out</button>
{:else}
  <button on:click={handleSignIn}>Sign In</button>
  <button on:click={handleSignUp}>Sign Up</button>
{/if}
```

## 📊 GraphQL Quick Examples

### Query Example
```graphql
query GetPosts {
  listBlogContents {
    items {
      id
      title
      slug
      description
    }
  }
}
```

### Mutation Example
```graphql
mutation CreatePost($input: CreateBlogContentInput!) {
  createBlogContent(input: $input) {
    id
    title
    slug
  }
}
```

**Variables:**
```json
{
  "input": {
    "slug": "my-post",
    "title": "My First Post",
    "content": "Post content here..."
  }
}
```

## 🛠️ Development Commands

```bash
# Development
npm run dev                    # Start frontend dev server
npm run amplify:sandbox        # Start Amplify backend in watch mode
npm run build                  # Production build
npm run preview                # Preview production build locally

# Testing
npm run test                   # Run Playwright tests
npm run check                  # Type checking

# Code Quality
npm run lint                   # Check code quality
npm run format                 # Format code

# Deployment
npm run amplify:deploy         # Deploy to AWS production
```

## 🚀 Deploy to Production

### Quick Deploy

```bash
# 1. Build
npm run build

# 2. Deploy backend
npm run amplify:deploy

# 3. Deploy frontend via CI/CD (push to main)
git push origin main
```

### Full Setup (Recommended)

See `DEPLOYMENT.md` for:
- Setting up CI/CD pipeline
- Configuring custom domains
- Production security setup
- Monitoring and alerts

## 🐛 Troubleshooting

### "Cannot find module 'aws-amplify'"
```bash
npm install
```

### API not responding
```bash
# Check API is up
curl -v https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql \
  -H "x-api-key: da2-35wqvptwardgdldmxwcq7l3stq"
```

### Backend changes not syncing
- Ensure `npm run amplify:sandbox` is running
- Check `.env` is not blocking file changes
- Restart the sandbox process

### Authentication not working
- Verify Cognito User Pool ID in `amplify_outputs.json`
- Check Amplify is initialized in `src/routes/+layout.svelte`
- Check browser console for errors

## 📖 Full Documentation

| Document | Purpose |
|----------|---------|
| `DEPLOYMENT.md` | Complete deployment guide with CI/CD setup |
| `API_REFERENCE.md` | Detailed GraphQL API reference |
| `PRODUCTION_CHECKLIST.md` | Pre-launch production checklist |
| `README.md` | Project overview |

## 🎯 Next Steps

1. **Test locally** - Run dev server and test queries
2. **Add authentication UI** - Use the examples above
3. **Connect to GraphQL** - Query and mutate data
4. **Test in staging** - Deploy to Amplify console
5. **Go to production** - Follow production checklist
6. **Monitor** - Set up CloudWatch dashboards

## 💡 Tips & Tricks

### Enable GraphQL Queries Generation
```bash
npm install -D @aws-amplify/cli
amplify codegen
```

### Test with GraphQL Playground
Visit: `https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/`

### Monitor Performance
```bash
# View CloudWatch metrics
aws cloudwatch list-metrics --namespace AWS/AppSync
```

### View Logs
```bash
# AppSync logs
aws logs tail /aws/appsync/apis --follow

# Lambda logs
aws logs tail /aws/lambda --follow
```

## 🆘 Getting Help

- **Amplify Docs:** https://docs.amplify.aws/
- **AppSync Docs:** https://docs.aws.amazon.com/appsync/
- **SvelteKit Docs:** https://kit.svelte.dev/
- **GraphQL Docs:** https://graphql.org/learn/

## ✅ Verify Everything Works

Run this checklist:

- [ ] `npm run amplify:sandbox` starts without errors
- [ ] `npm run dev` starts the frontend
- [ ] Can access `http://localhost:5173`
- [ ] GraphQL query returns data (see curl example above)
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors in `npm run check`

**All checked? You're ready to develop! 🎉**

---

**Ready to deploy to production?** Follow the steps in `DEPLOYMENT.md` for full CI/CD setup.
