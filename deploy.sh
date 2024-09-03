#!/bin/bash

. .env
export APP_DOMAIN
export TTS_DOMAIN

echo "Building app image..."
echo

docker build . -t localhost:32000/vessel-app
docker push localhost:32000/vessel-app

echo "Deploying to cluster..."
echo

$KUBECTL apply -f ./runtime-config/k8s/tts/tts-volume-claim.yaml
$KUBECTL apply -f ./runtime-config/k8s/tts/service-tts.yaml
$KUBECTL apply -f ./runtime-config/k8s/tts/deployment-tts.yaml

$KUBECTL apply -f ./runtime-config/k8s/app/service-app.yaml
$KUBECTL apply -f ./runtime-config/k8s/app/deployment-app.yaml

envsubst '${APP_DOMAIN} ${TTS_DOMAIN}' < ./runtime-config/k8s/ingress.yaml | $KUBECTL apply -f -

$KUBECTL rollout restart deployment vessel-app
