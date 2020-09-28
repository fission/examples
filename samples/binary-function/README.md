# Binary Environment Example with multiple files

This example shows using fission binary environment with multiple programs. This environment uses a WIP PR's change (https://github.com/fission/fission/pull/1723) and image available here: vishalbiyani/binary-env:1 but eventually this change will be merged in the Fission.

The code is simple - entry.sh is a simple shell script which calls a go program and passes an argument to go program.

To run, first compile Go program to Linux OS:

```
$ GOOS=linux go build -o goprog
```

## With CLI

We can provide multiple files with --deploy flag and the files are accessible in directory /userfunc/deployarchive - so you can use that path from within main source file.

```
$ fission env create --name binary --image vishalbiyani/binary-buster-env:1 --poolsize 1
$ fission fn create --env binary --deploy run.sh --deploy gobuster --deploy list_small.txt --name scanner --entrypoint run.sh
```

## With Specs

And then `fission spec apply` to push environment and function to Kubernetes and test it:

```
$ fission spec apply

DeployUID: e8c26a1b-8a07-4b08-874b-70563b0d1d4f
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
uploading archive archive://entry-sh-clRt
1 package updated: bfunc-86c06233-f5e8-40b4-8b2c-3a2065ee5d79
1 function updated: bfunc

$ fission fn test --name bfunc

Inside Shell
Inside Go Ola!
Arguments: [hello]
```