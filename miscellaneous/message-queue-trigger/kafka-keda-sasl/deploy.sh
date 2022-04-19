zip -j producer.zip kafka-producer/*
zip -j consumer.zip kafka-consumer/*
kubectl apply -f kafka-config.yaml
fission spec apply