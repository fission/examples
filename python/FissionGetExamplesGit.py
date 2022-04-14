import requests
import json

# maintaining lists for python and sample sub trees(folders)
pythonexamples = []
samplesexamples=[]

# mainting a list to add names and paths for creating the json object later on
name, path = [],[]

# Getting all repositories from Examples repo
response = requests.get('https://api.github.com/repos/fission/examples/git/trees/master?recursive=-1')
res = response.json()['tree']

#print('*** Root Examples: ')

# Looping through the list and extracing the root directories, currently only Python and Samples have further projects in them,
# so taking that respective SHA and storing the path in pythonexamples and samplesexamples
for x in res:
    if x.get("type") == "tree":
        if not '/' in x.get('path'):
            #print('\nName: '+x.get('path')+"\nPath: "+'https://github.com/fission/examples/tree/master/'+x.get('path'))
            name.append(x.get('path'))
            path.append('https://github.com/fission/examples/tree/master/'+x.get('path'))
            if 'python' in x.get('path'):
               pythonexamples.append('https://api.github.com/repos/fission/examples/git/trees/'+x.get('sha'))
            elif 'samples' in x.get('path'):
               samplesexamples.append('https://api.github.com/repos/fission/examples/git/trees/'+x.get('sha'))             
            continue
        
#print('***** Subdirectories: ')

# Getting all repositories from Python folder and listing them
for j in pythonexamples:
    res = requests.get(j).json()['tree']
    for i in res:
        if i.get("type") == "tree":
            #print('\nName: '+i.get('path')+"\nPath: "+'https://github.com/fission/examples/tree/master/python/'+i.get('path'))
            name.append(i.get('path'))
            path.append('https://github.com/fission/examples/tree/master/python/'+i.get('path'))

# Getting all repositories from Samples folder and listing them
for j in samplesexamples:
    res = requests.get(j).json()['tree']
    for i in res:
        if i.get("type") == "tree":
            #print('\nName: '+i.get('path')+"\nPath: "+'https://github.com/fission/examples/tree/master/samples/'+i.get('path'))
            name.append(i.get('path'))
            path.append('https://github.com/fission/examples/tree/master/samples/'+i.get('path'))

# Creating a JSON object with name and path
allexamples = [{"Name": t, "Path": s} for t, s in zip(name, path)]

print(json.dumps(allexamples))