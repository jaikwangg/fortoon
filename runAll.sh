export DOCKER_DEFAULT_PLATFORM=linux/amd64 && 
    docker network create my_network ||
    docker compose -f docker-compose.dev.yml build &&
    docker compose -f docker-compose.dev.yml up