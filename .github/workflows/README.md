# GitHub Actions Workflows

## Docker Build and Push Workflow

This workflow automatically builds and pushes Docker images to Docker Hub when pull requests are merged to the `main` branch.

## Setup Instructions

### 1. Create Docker Hub Account
If you don't have one, sign up at [hub.docker.com](https://hub.docker.com)

### 2. Create Docker Hub Access Token
1. Log in to Docker Hub
2. Go to **Account Settings** → **Security** → **New Access Token**
3. Create a token with **Read, Write, Delete** permissions
4. Copy the token (you won't see it again!)

### 3. Add GitHub Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   - **Name**: `DOCKER_USERNAME`
   - **Value**: Your Docker Hub username

   - **Name**: `DOCKER_PASSWORD`
   - **Value**: Your Docker Hub access token (not your password!)

### 4. Workflow Triggers

The workflow runs when:
- ✅ A pull request is **merged** to `main` branch
- ✅ Code is pushed directly to `main` branch
- ❌ Does NOT run on draft PRs or unmerged PRs

### 5. What Gets Built

The workflow creates multi-platform images:
- `linux/amd64` (Intel/AMD processors)
- `linux/arm64` (ARM processors, Apple Silicon, AWS Graviton)

### 6. Docker Image Tags

Images are tagged with:
- `latest` - Latest build from main branch
- `main-<commit-sha>` - Specific commit version
- `main` - Current main branch

Example:
```bash
docker pull yourusername/eztools:latest
docker pull yourusername/eztools:main-a1b2c3d
docker pull yourusername/eztools:main
```

## Running the Built Image

After the workflow completes, pull and run your image:

```bash
# Pull the latest image
docker pull yourusername/eztools:latest

# Run the container
docker run -d \
  --name eztools \
  -p 3000:3000 \
  -e NODE_ENV=production \
  yourusername/eztools:latest

# Or use Docker Compose with your published image
# Update docker-compose.yml to use: image: yourusername/eztools:latest
```

## Monitoring Workflow

1. Go to **Actions** tab in your GitHub repository
2. Click on the workflow run to see logs
3. Check for any build errors or warnings

## Build Cache

The workflow uses Docker layer caching to speed up builds:
- First build: ~5-10 minutes
- Subsequent builds: ~2-5 minutes (with cache)

## Troubleshooting

### Authentication Failed
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are correct
- Ensure you're using an access token, not your password
- Check if the token has write permissions

### Build Failed
- Check the Actions logs for specific errors
- Verify the Dockerfile is correct
- Ensure `next.config.ts` has `output: 'standalone'`

### Image Not Found
- Confirm the workflow completed successfully
- Check Docker Hub to see if the image was pushed
- Verify the image name matches your Docker Hub username

## Advanced Configuration

### Build on Specific Branches
Edit `.github/workflows/docker-publish.yml`:
```yaml
on:
  push:
    branches:
      - main
      - develop  # Add more branches
```

### Custom Image Name
Update the `images` field in the workflow:
```yaml
images: yourusername/custom-name
```

### Add Version Tags
For semantic versioning, add to your workflow:
```yaml
tags: |
  type=semver,pattern={{version}}
  type=semver,pattern={{major}}.{{minor}}
```

## Security Best Practices

1. ✅ Use Docker Hub access tokens (not passwords)
2. ✅ Store credentials as GitHub Secrets
3. ✅ Limit token permissions to specific repositories
4. ✅ Rotate access tokens periodically
5. ✅ Use Dependabot to keep GitHub Actions updated

## Cost Considerations

Docker Hub Free Tier:
- 1 private repository
- Unlimited public repositories
- No pull rate limits for public images

GitHub Actions Free Tier:
- 2,000 minutes/month for private repos
- Unlimited for public repos
- Each build takes ~5-10 minutes

## Next Steps

1. Set up the secrets in GitHub
2. Create a test PR and merge it
3. Check the Actions tab for build progress
4. Verify the image on Docker Hub
5. Pull and test the image locally
