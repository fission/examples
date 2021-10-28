pushd kafka-producer
zip producer.zip *
popd

pushd kafka-consumer
zip consumer.zip *
popd

mv kafka-producer/producer.zip .
mv kafka-consumer/consumer.zip .

kubectl apply -f kafka-config.yaml
fission spec apply