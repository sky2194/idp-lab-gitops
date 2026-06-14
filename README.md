# 🗂️ idp-lab-gitops

The GitOps configuration repository for the IDP Lab platform. This is the single source of truth for all Kubernetes deployments, ArgoCD applications, and Backstage templates.

## Repository Structure

```
idp-lab-gitops/
├── apps/                          # Kubernetes manifests per service
│   ├── hello-world/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── payment-ui/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── payment-service/
│       ├── deployment.yaml
│       └── service.yaml
├── argocd/
│   └── apps/                      # ArgoCD Application manifests
│       ├── app-of-apps.yaml       # Parent app watching this folder
│       ├── hello-world.yaml
│       ├── payment-ui.yaml
│       └── payment-service.yaml
├── platform/
│   └── compositions/              # Crossplane XRDs and Compositions
│       ├── appenv-xrd.yaml
│       ├── appenv-composition.yaml
│       └── appenv-claim.yaml
└── backstage/
    └── templates/                 # Backstage golden path templates
        ├── new-service-template.yaml
        ├── skeleton/
        │   ├── python/            # Python starter app
        │   ├── nodejs/            # Node.js starter app
        │   └── minimal/           # Minimal README + .gitignore
        └── gitops-skeleton/       # Auto-generated deployment manifests
```

## How it works

### GitOps Loop
1. Developer creates a service via Backstage
2. Backstage raises a PR to this repo with deployment manifests
3. PR is reviewed and merged
4. ArgoCD detects the change and syncs to the cluster automatically

### App of Apps Pattern
`argocd/apps/` is watched by the `app-of-apps` ArgoCD Application. Any new `.yaml` file added here automatically creates a new ArgoCD Application — no manual setup needed.

### Crossplane Self-Service Infra
The `platform/compositions/` folder defines a custom `AppEnvironment` Kubernetes kind. When a claim is submitted, Crossplane automatically creates:
- Namespace
- ResourceQuota (CPU/memory limits)
- NetworkPolicy

## Golden Path Template

The Backstage template at `backstage/templates/new-service-template.yaml` offers:

| Field | Options |
|---|---|
| Language | Python, Node.js |
| Starter | Full sample app, Minimal |
| Namespace | dev, dev2 |
| Team | team-angular, team-backend, team-platform, team-data |

## Tech Stack

- **Kubernetes** — kind (local cluster)
- **GitOps** — ArgoCD v3.4.3
- **Self-service infra** — Crossplane
- **CI/CD** — GitHub Actions
- **Developer portal** — Backstage
- **Registry** — Docker Hub

## Running locally

```bash
# Start the cluster
kind create cluster --name idp-lab

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Install Crossplane
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm install crossplane crossplane-stable/crossplane --namespace crossplane-system --create-namespace

# Start Backstage
cd idp-lab-backstage
yarn workspace backend start
yarn workspace app start

# Port forwards
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
kubectl port-forward svc/payment-ui -n dev 8081:80 &
kubectl port-forward svc/payment-service -n dev 8082:80 &
```

Built by [@sky2194](https://github.com/sky2194)
