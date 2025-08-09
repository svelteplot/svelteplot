# GitHub Workflows

This directory contains GitHub workflows for the SveltePlot repository.

## test.yml

This workflow runs the automated test suite for the project on push to main branch and pull requests.

## deploy-main-docs.yml

This workflow automatically deploys the main branch documentation to GitHub Pages at the root URL. It runs whenever changes are pushed to the main branch.

## deploy-docs.yml

This workflow automatically deploys the documentation website to GitHub Pages with a URL path prefixed with "~" and the branch name. This enables reviewing documentation changes for each branch without affecting the main documentation site.

### How the Documentation Workflows Work

#### Main Branch Deployment

When you push to the main branch:

- The `deploy-main-docs.yml` workflow is triggered
- It builds the documentation site using `pnpm build` without a specific base path
- Deploys the built files to the root of GitHub Pages

URLs for the main branch deployment:

- `https://<username-or-org>.github.io/<repo-name>/`

#### Feature Branch Deployments

When you push to any branch except main:

- The `deploy-docs.yml` workflow is triggered
- It builds the documentation site using `pnpm build` with a base path set to "~{branch-name}"
- Deploys the built files to GitHub Pages under a subfolder with the "~" prefix

URLs for branch deployments will follow this pattern:

- `https://<username-or-org>.github.io/<repo-name>/~{branch-name}/`

The tilde prefix ("~") is used to avoid conflicts with existing directories in the main documentation site.

### Required Setup

Before these workflows can function properly, you need to:

1. **Enable GitHub Pages** for your repository:

    - Go to repository Settings > Pages
    - Set up GitHub Pages to deploy from GitHub Actions
    - Make sure the repository has the necessary permissions (pages: write, id-token: write)

2. No additional credentials are needed as GitHub handles the authentication

### GitHub Pages Configuration

Both workflows are configured to use the official GitHub Pages actions:

- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

These actions handle the upload and deployment to GitHub Pages automatically.

### Branching Considerations

- Branches with slashes in their names (e.g., `feature/new-chart`) will have the slashes replaced with hyphens in the deployment path (e.g., `~feature-new-chart`)
- The `~` prefix in the URL helps ensure that branch deployments don't conflict with directories in the main documentation site

### Troubleshooting

If the deployment fails, check:

- GitHub Pages is enabled for your repository
- The repository has the correct permissions configured in the workflow file
- Your branch name doesn't contain any special characters that could cause path issues
