# GraphQL API Reference

## Endpoint

```
https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql
```

## Authentication

### API Key (Public Access)
```bash
curl -X POST https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: da2-35wqvptwardgdldmxwcq7l3stq" \
  -d '{"query": "..."}'
```

### Cognito Authentication
```bash
curl -X POST https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -d '{"query": "..."}'
```

## Data Models

### BlogContent
Blog post content with full text and metadata.

**Fields:**
- `id` (ID!) - Unique identifier
- `slug` (String!) - URL-friendly identifier
- `title` (String!) - Post title
- `description` (String) - Short description
- `content` (String!) - Full post content
- `createdAt` (AWSDateTime) - Creation timestamp
- `updatedAt` (AWSDateTime) - Last update timestamp

### ContentList
Lightweight content metadata for listings.

**Fields:**
- `id` (ID!) - Unique identifier
- `title` (String!) - Item title
- `description` (String) - Short description
- `slug` (String!) - URL-friendly identifier
- `date` (String) - Publication date

## Query Examples

### List All Blog Posts
```graphql
query ListBlogContent {
  listBlogContents {
    items {
      id
      slug
      title
      description
      createdAt
    }
  }
}
```

### Get Single Blog Post
```graphql
query GetBlogPost($id: ID!) {
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

### Search by Slug
```graphql
query SearchBySlug($slug: String!) {
  listBlogContents(filter: { slug: { eq: $slug } }) {
    items {
      id
      title
      content
    }
  }
}
```

### List Content Metadata
```graphql
query ListContentMetadata {
  listContentLists {
    items {
      id
      title
      slug
      date
      description
    }
  }
}
```

## Mutation Examples

### Create Blog Post
```graphql
mutation CreateBlogPost($input: CreateBlogContentInput!) {
  createBlogContent(input: $input) {
    id
    slug
    title
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "slug": "my-first-post",
    "title": "My First Post",
    "description": "This is my first blog post",
    "content": "Full markdown or HTML content here..."
  }
}
```

### Update Blog Post
```graphql
mutation UpdateBlogPost($input: UpdateBlogContentInput!) {
  updateBlogContent(input: $input) {
    id
    title
    updatedAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "id": "POST_ID",
    "title": "Updated Title",
    "content": "Updated content..."
  }
}
```

### Delete Blog Post
```graphql
mutation DeleteBlogPost($input: DeleteBlogContentInput!) {
  deleteBlogContent(input: $input) {
    id
  }
}
```

**Variables:**
```json
{
  "input": {
    "id": "POST_ID"
  }
}
```

## Real-time Subscriptions

### Subscribe to New Posts
```graphql
subscription OnNewBlogPost {
  onCreateBlogContent {
    id
    title
    slug
    createdAt
  }
}
```

### Subscribe to Updates
```graphql
subscription OnBlogPostUpdate {
  onUpdateBlogContent {
    id
    title
    updatedAt
  }
}
```

### Subscribe to Deletions
```graphql
subscription OnBlogPostDelete {
  onDeleteBlogContent {
    id
  }
}
```

## Testing with cURL

### Test Introspection
```bash
curl -X POST https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: da2-35wqvptwardgdldmxwcq7l3stq" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

### List Blog Content
```bash
curl -X POST https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: da2-35wqvptwardgdldmxwcq7l3stq" \
  -d '{
    "query": "query { listBlogContents { items { id title slug } } }"
  }'
```

## Testing with GraphQL Clients

### Apollo Client (JavaScript)
```javascript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql',
    headers: {
      'x-api-key': 'da2-35wqvptwardgdldmxwcq7l3stq'
    }
  }),
  cache: new InMemoryCache(),
});
```

### AWS Amplify Client
```javascript
import { generateClient } from 'aws-amplify/api';
import { listBlogContents } from './graphql/queries';

const client = generateClient();

const result = await client.graphql({
  query: listBlogContents,
  variables: {
    limit: 10
  }
});
```

### VS Code GraphQL Extension
Install "GraphQL: Language Feature Support" extension and configure:

```json
{
  "graphql.endpoints": [
    {
      "name": "Swyxkit API",
      "url": "https://3idu3v3qnzg2zfirxfxzz622la.appsync-api.us-east-1.amazonaws.com/graphql",
      "headers": {
        "x-api-key": "da2-35wqvptwardgdldmxwcq7l3stq"
      }
    }
  ]
}
```

## Error Handling

### Typical Error Response
```json
{
  "errors": [
    {
      "message": "Not Authorized to access getBlogContent on type Query",
      "errorType": "Unauthorized",
      "path": ["getBlogContent"]
    }
  ]
}
```

### Common Error Types
- `Unauthorized` - Authentication failed
- `ValidationError` - Invalid input
- `NotFound` - Resource doesn't exist
- `Throttled` - Rate limit exceeded
- `InternalFailure` - Server error

## Rate Limiting

- On-demand billing (DynamoDB)
- No hard rate limits
- Scales automatically with demand
- CloudWatch monitoring available

## Pricing

- **Queries/Mutations:** $0.25 per million requests
- **Real-time Subscriptions:** $0.25 per million connection-minutes
- **Data Transfer:** Standard AWS data transfer charges

## Support Resources

- [AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/)
- [GraphQL Best Practices](https://graphql.org/learn/)
