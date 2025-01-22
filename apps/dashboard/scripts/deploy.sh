#!/bin/bash

# Build da imagem Docker
pnpm run docker:build

# Push para o registry
pnpm run docker:push

# Deploy (exemplo com kubectl)
kubectl apply -f k8s/dashboard/ 