## A Python based multifile example

### Create an environment

```
$ fission env create --name python --image fission/python-env --version 3 --poolsize 1
```

Create a function with all files - here we use two python files and one text file.

```
$ fission function create --name multifile --env python --deploy main.py --deploy message.txt --deploy readfile.py --entrypoint main.main
```


```
$ fission fn test --name multifile
Hello, world from a file!%
```