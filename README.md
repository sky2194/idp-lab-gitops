# 🗂️ idp-lab-gitops

The GitOps configuration repository for IDP Lab — a Mini Internal Developer Platform built from scratch to demonstrate modern platform engineering practices.

This is the **single source of truth** for all Kubernetes deployments, ArgoCD applications, Crossplane compositions, and Backstage golden path templates.

## Architecture

```
Developer fills Backstage form
        ↓
GitHub repo created under idp-lab-org (code + CI pipeline)
        ↓
PR raised to idp-lab-gitops (deployment manifests + ArgoCD app)
        ↓
PR reviewed and merged
        ↓
ArgoCD detects change → deploys to Kubernetes automatically
        ↓
Service running in dev namespace • registered in Backstage catalog
```

## Repository Structure

```
idp-lab-gitops/
├── apps/                          # Kubernetes manifests per service
│   ├── hello-world/
│   ├── payment-ui/
│   └── payment-service/
├── argocd/
│   └── apps/                      # ArgoCD Application manifests
│       ├── app-of-apps.yaml       # Parent — watches this entire folder
│       ├── hello-world.yaml
│       ├── payment-ui.yaml
│       └── payment-service.yaml
├── platform/
│   └── compositions/              # Crossplane XRDs and Compositions
│       ├── appenv-xrd.yaml        # Custom AppEnvironment kind
│       ├── appenv-composition.yaml
│       └── appenv-claim.yaml
└── backstage/
    └── templates/
        ├── new-service-template.yaml   # Golden path template
        ├── skeleton/
        │   ├── python/                 # Python starter app
        │   ├── nodejs/                 # Node.js starter app
        │   └── minimal/               # README + .gitignore only
        └── gitops-skeleton/           # Auto-generated deployment manifests
```

## App of Apps Pattern

`argocd/apps/` is watched by the `app-of-apps` ArgoCD Application. Any new `.yaml` file added here automatically creates a new ArgoCD Application — no manual registration needed.

```
app-of-apps (watches argocd/apps/)
    ├── hello-world.yaml     → ArgoCD deploys apps/hello-world/
    ├── payment-ui.yaml      → ArgoCD deploys apps/payment-ui/
    └── payment-service.yaml → ArgoCD deploys apps/payment-service/
```

## Golden Path Template

The Backstage template at `backstage/templates/new-service-template.yaml` gives developers:

| Field | Options |
|---|---|
| Language | Python, Node.js |
| Starter | Full sample app, Minimal (README + .gitignore) |
| Namespace | dev (stable), dev2 (feature/experimental) |
| Team | team-angular, team-backend, team-platform, team-data |

Every service created gets:
- ✅ GitHub repo with working starter code
- ✅ GitHub Actions CI (build + push Docker image to Docker Hub)
- ✅ Kubernetes deployment + service manifests
- ✅ ArgoCD Application (auto-sync to cluster)
- ✅ Backstage catalog registration

## Crossplane Self-Service Infra

`platform/compositions/` defines a custom `AppEnvironment` Kubernetes kind. Submitting a claim automatically creates a namespace, ResourceQuota, and NetworkPolicy — no manual ops ticket needed.

## Tech Stack

| Layer | Tool |
|---|---|
| Kubernetes | kind (local cluster) |
| GitOps | ArgoCD v3.4.3 |
| Self-service infra | Crossplane |
| CI/CD | GitHub Actions → Docker Hub (sky2108) |
| Developer portal | Backstage |
| GitHub auth | GitHub App (idp-lab-backstage) — no PAT tokens |

## Security

- GitHub App used for authentication (not personal PAT tokens)
- Org-level secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `GITOPS_TOKEN`
- No credentials committed to any repo
- Pre-commit hooks block `.pem` files and credential patterns

## Running Locally

```bash
# Start the cluster
kind create cluster --name idp-lab

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Install Crossplane
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm install crossplane crossplane-stable/crossplane \
  --namespace crossplane-system --create-namespace

# Start everything
~/Projects/IDP\ Mini/start-demo.sh
```

## Demo Endpoints

| Service | URL |
|---|---|
| Backstage | http://localhost:3000 |
| ArgoCD | https://localhost:8080 |
| payment-ui | http://localhost:8081 |
| payment-service | http://localhost:8082 |

Part of [idp-lab-org](https://github.com/idp-lab-org) — built by [@sky2194](https://github.com/sky2194)
