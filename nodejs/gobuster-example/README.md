# Penetration testing with Gobuster & Fission

[Gobuster](https://github.com/OJ/gobuster) is a tool for bruteforcing websites Directory/File, DNS and VHost written in Go. It enables penetration testing and and brute forcing for hackers and testers. In this tutorial we will use Gobuster with Fission's binary environment to run it for specific sites and for specific patterns listed in a text file.

We have a simple shell script which uses gobuster binary and provides as argument a website and the txt file which has patterns to be tested for. You can notice that all files are being referenced from directory `/userfunc/deployarchive/` - i.e. because we are using deployment archive type and all files will land in same directory.

```sh
#!/bin/sh

echo "Inside Shell"
/userfunc/deployarchive/gobuster dir -u https://www.kubeflow.org -w /userfunc/deployarchive/list_small.txt
```

We are using a smaller version of patterns to finish execution faster - but you can always use full list of patterns and use a higher timeout on function so that entire execution actually finishes.

```
.bash_history
.bashrc
.cache
.config
.cvs
.cvsignore
.forward
.git/HEAD
.history
.hta
.htaccess
.htpasswd
```

Let's now apply the functions to K8S cluster

```sh
$ fission spec apply
DeployUID: 911be734-bb01-4abf-b7aa-a8bc99cc7ce9
Resources:
 * 1 Functions
 * 1 Environments
 * 1 Packages
 * 0 Http Triggers
 * 0 MessageQueue Triggers
 * 0 Time Triggers
 * 0 Kube Watchers
 * 1 ArchiveUploadSpec
Validation Successful
uploading archive archive://gobuster-BFoT
1 environment created: binary
1 package created: gobuster-053465b6-c014-4409-8bfb-cc1d4321ab40
1 function created: gobuster

```

And test function:

```
$ fission fn test --name gobuster
Inside Shell
===============================================================
Gobuster v3.0.1
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@_FireFart_)
===============================================================
[+] Url:            https://www.kubeflow.org
[+] Threads:        10
[+] Wordlist:       /userfunc/deployarchive/list_small.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Timeout:        10s
===============================================================
2021/04/15 09:17:55 Starting gobuster
===============================================================
===============================================================
2021/04/15 09:17:57 Finished
===============================================================
```

We did not get a whole lot of results, so change the run.sh to point to Apple's website and do fission spec apply again. Now we can test the function with the changes:

```
$ fission fn test --name gobuster
Inside Shell
===============================================================
Gobuster v3.0.1
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@_FireFart_)
===============================================================
[+] Url:            https://www.apple.com
[+] Threads:        10
[+] Wordlist:       /userfunc/deployarchive/list_small.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Timeout:        10s
===============================================================
2021/04/15 06:19:55 Starting gobuster
===============================================================
/.git/HEAD (Status: 403)
/.history (Status: 403)
/.htpasswd (Status: 403)
/.hta (Status: 403)
/.listing (Status: 403)
/.mysql_history (Status: 403)
/.forward (Status: 403)
/.perf (Status: 403)
/.cache (Status: 403)
/.rhosts (Status: 403)
/.htaccess (Status: 403)
===============================================================
2021/04/15 06:19:59 Finished
===============================================================
```