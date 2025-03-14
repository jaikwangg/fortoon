docker kill $(docker ps -aq) && docker rm $(docker ps -aq) 

docker system prune -af --volumes