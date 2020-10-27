echo "GET http://LB_ADDRESS/fission-function/hello-1-15" | vegeta attack -duration=300s -timeout=3600s -rate=2500/1m -max-workers=13000> hello-1-15.txt &

echo "GET http://LB_ADDRESS/fission-function/hello-2-45" | vegeta attack -duration=300s -timeout=3600s -rate=1500/1m -max-workers=8000> hello-2-45.txt &

echo "GET http://LB_ADDRESS/fission-function/hello-3-75" | vegeta attack -duration=300s -timeout=3600s -rate=1500/1m -max-workers=8000> hello-3-75.txt &

echo "GET http://LB_ADDRESS/fission-function/hello-4-90" | vegeta attack -duration=300s -timeout=4800s -rate=1000/1m -max-workers=6000> hello-4-90.txt &

echo "GET http://LB_ADDRESS/fission-function/hello-5-120" | vegeta attack -duration=300s -timeout=4800s -rate=1000/1m -max-workers=6000> hello-5-120.txt &
