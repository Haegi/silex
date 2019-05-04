
# Configuration of Raspberry Pi K8s Cluster
* k8s-master: 192.168.0.100
* k8s-worker-1: 192.168.0.101

# ssh
` shh user@ip`    
OS: hypriot    
user:pirate    
password: hypriot   

# On master node
`sudo kubeadm reset`

`sudo kubeadm init --token-ttl=0 --apiserver-advertise-address=192.168.0.100 --pod-network-cidr=10.244.0.0/16 --ignore-preflight-errors all`

`sudo sysctl net.bridge.bridge-nf-call-iptables=1`

`mkdir -p $HOME/.kube`

`sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config`

`sudo chown $(id -u):$(id -g) $HOME/.kube/config`

`curl -sSL https://raw.githubusercontent.com/coreos/flannel/bc79dd1505b0c8681ece4de4c0d86c5cd2643275/Documentation/kube-flannel.yml | sed "s/amd64/arm/g" | kubectl create -f - `


# On worker node
`sudo sysctl net.bridge.bridge-nf-call-iptables=1`

`sudo kubeadm join 192.168.0.100:6443 --token bvx7xf.vj3yxivw6ih5lji4 --discovery-token-ca-cert-hash sha256:6f26880f67be11a0bc55f57d76a0237e657130dea92c84edcea3a60cdc8759dd --ignore-preflight-errors all`

# After configuartion

# Expose service

LoadBalancer and Ingress is not possible on the Raspberry instead you can use the NodePort to expose the service to the internet.

`kubectl expose deployment deployment_name --type=NodePort --name=controller`


## port-forwarding:
`kubectl proxy --address= —port 443 --accept-hosts='.*' --accept-paths='.*'`   

access it over path:   
`http://192.168.0.100:8080/api/v1/namespaces/default/services/node-web-app/proxy/`



## MongoDB ReplicaSet initiate
`rs.initiate( { _id: "rs0", version: 1, members: [ { _id: 0, host : "mongo-0.mongo:27017" }] } );`