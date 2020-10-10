
echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-1-15" | vegeta attack -duration=300s -timeout=3600s -rate=1200/m -max-workers=2000> hello-1-15.txt

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-2-45" | vegeta attack -duration=300s -timeout=3600s -rate=700/m -max-workers=2000> hello-2-45.txt

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-3-75" | vegeta attack -duration=300s -timeout=3600s -rate=700/m -max-workers=2000> hello-3-75.txt

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-4-90" | vegeta attack -duration=300s -timeout=3600s -rate=500/m -max-workers=2000> hello-4-90.txt

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-5-120" | vegeta attack -duration=300s -timeout=3600s -rate=500/m -max-workers=2000> hello-5-120.txt