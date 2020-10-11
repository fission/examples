echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-1-15" | vegeta attack -duration=300s -timeout=3600s -rate=2500/m -max-workers=2000> hello-1-15.txt &

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-2-45" | vegeta attack -duration=300s -timeout=3600s -rate=1500/m -max-workers=2000> hello-2-45.txt &

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-3-75" | vegeta attack -duration=300s -timeout=3600s -rate=1500/m -max-workers=2000> hello-3-75.txt &

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-4-90" | vegeta attack -duration=300s -timeout=4800s -rate=1000/m -max-workers=2000> hello-4-90.txt &

echo "GET http://a72c0989896a24498b58842b22da42a6-2126244409.ap-south-1.elb.amazonaws.com/fission-function/hello-5-120" | vegeta attack -duration=300s -timeout=4800s -rate=1000/m -max-workers=2000> hello-5-120.txt &

root@test-temp:~# vegeta report hello-5-120.txt
Requests      [total, rate, throughput]         2001, 2.03, 0.59
Duration      [total, attack, wait]             49m42s, 16m27s, 33m15s
Latencies     [min, mean, 50, 90, 95, 99, max]  16m26s, 36m24s, 38m58s, 45m26s, 46m29s, 47m3s, 47m9s
Bytes In      [total, mean]                     20325, 10.16
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           87.86%
Status Codes  [code:count]                      200:1758  502:243
Error Set:
502 Bad Gateway

root@test-temp:~# vegeta report hello-4-90.txt
Requests      [total, rate, throughput]         2001, 2.11, 0.65
Duration      [total, attack, wait]             49m15s, 15m49s, 33m26s
Latencies     [min, mean, 50, 90, 95, 99, max]  15m47s, 35m16s, 37m54s, 45m12s, 45m53s, 46m27s, 46m35s
Bytes In      [total, mean]                     15827, 7.91
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           96.50%
Status Codes  [code:count]                      200:1931  502:70
Error Set:
502 Bad Gateway

root@test-temp:~# vegeta report hello-3-75.txt
Requests      [total, rate, throughput]         2001, 2.38, 0.68
Duration      [total, attack, wait]             49m2s, 13m59s, 35m3s
Latencies     [min, mean, 50, 90, 95, 99, max]  13m59s, 29m45s, 31m12s, 40m9s, 41m7s, 41m52s, 41m58s
Bytes In      [total, mean]                     14007, 7.00
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:2001
Error Set:

root@test-temp:~# vegeta report hello-2-45.txt
Requests      [total, rate, throughput]         2001, 2.47, 0.69
Duration      [total, attack, wait]             48m34s, 13m29s, 35m5s
Latencies     [min, mean, 50, 90, 95, 99, max]  13m29s, 28m13s, 29m51s, 38m44s, 39m53s, 40m55s, 41m30s
Bytes In      [total, mean]                     14007, 7.00
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:2001
Error Set:

root@test-temp:~# vegeta report hello-1-15.txt
Requests      [total, rate, throughput]         2001, 2.68, 0.68
Duration      [total, attack, wait]             48m59s, 12m26s, 36m34s
Latencies     [min, mean, 50, 90, 95, 99, max]  12m26s, 21m12s, 20m50s, 28m59s, 29m58s, 39m4s, 48m16s
Bytes In      [total, mean]                     14007, 7.00
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:2001
Error Set: