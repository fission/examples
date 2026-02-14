This is an example of creating a deployment package with dependencies not available on pypi (build .tar.gz file given) 

### Procedure

```commandline
./package.sh

fission env create --name my-env --image fission/python-env-3.10:latest --builder fission/python-builder-3.10:latest --spec
```

#### Then for every function created

```commandline

fission package create --sourcearchive function1.zip --env my-env --buildcmd "./build.sh"  --name function1-pkg --spec

fission fn create --name function1 --pkg function1-pkg --entrypoint "main.main" --env=my-env --spec  

fission route create --name function1-route --method GET --url /func1 --function function1 --spec 
```

#### Destroy is only required if the env is messed up and it needs to be cleaned. 
```commandline
fission spec destroy
fission spec apply --delete
```
