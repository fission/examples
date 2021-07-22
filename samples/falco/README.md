## Falco Example

You can follow the steps described in the blog post [Kubernetes Response Engine, Part 8: Falcosidekick + Fission][1] to try the Falco and Fission integration.

## Prerequisites

- A kubernetes cluster
- Falco and falcosidekick installed

## Permissions

The following creates:

- a role with permissions required to delete the pwned pod
- a service account named `falco-pod-delete`
- a cluster role binding

```sh
kubectl apply -f sa-falco-pod-delete.yaml
```

## Apply specs

```sh
fission spec apply
```

[1]: https://falco.org/blog/falcosidekick-reponse-engine-part-8-fission/
