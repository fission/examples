# Running Tests

1) OS Preps & Tuning

```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 379CE192D401AB61
echo "deb https://dl.bintray.com/loadimpact/deb stable main" | sudo tee -a /etc/apt/sources.list
sudo apt-get update
sudo apt-get install k6
```

```
sysctl -w net.ipv4.ip_local_port_range="1024 65535"
sysctl -w net.ipv4.tcp_tw_reuse=1
sysctl -w net.ipv4.tcp_timestamps=1
sysctl -w net.core.rmem_max = 16777216
sysctl -w net.core.wmem_max = 16777216
sysctl -w net.ipv4.tcp_rmem = 4096 87380 16777216
sysctl -w net.ipv4.tcp_wmem = 4096 65536 16777216
sysctl -w net.ipv4.tcp_syncookies = 1
sysctl -w net.ipv4.tcp_mem = "50576   64768   98152"
sysctl -w net.core.netdev_max_backlog = 2500
sysctl -w net.ipv4.netfilter.ip_conntrack_max = 1048576

sysctl -p 

ulimit -n 250000

echo "1024 65535" > /proc/sys/net/ipv4/iplocalport_range

```

```
apt-get install -y htop iftop
```

) Running test

k6 run -e MY_HOSTNAME=LB_ADDRESS --summary-export export.json test-script.js

) Analyzing Results