zip -j producer.zip producer/*
zip -j consumer.zip consumer/*
kubectl apply -f secret.yaml
fission spec apply