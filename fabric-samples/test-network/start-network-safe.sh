#!/bin/bash

# Step 1: Stop all running Docker containers
docker stop 4a137515199b
67618c5e92e8
2a85882cb1e8 || true

# Step 2: Remove all Docker containers (forcefully)
docker rm -f 4a137515199b
67618c5e92e8
2a85882cb1e8 || true

# Step 3: Remove unused Docker volumes
docker volume prune -f

# Step 4: Update port configurations in compose file
sed -i s/9443:9443/19443:9443/g ./compose/compose-test-net.yaml
sed -i s/9445:9444/19451:9444/g ./compose/compose-test-net.yaml
sed -i s/9445:9445/19450:9445/g ./compose/compose-test-net.yaml

# Step 5: Clean up any existing network
./network.sh down

# Step 6: Bring up the network
./network.sh up

echo Network
