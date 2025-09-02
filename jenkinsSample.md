Jenkins


docker network create jenkinss

1.
   ```bash
   docker run -d \
  --name jenkins \
  -network jenkinss \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
  ```
-p 8080:8080 → Jenkins UI will be available at http://localhost:8080

-p 50000:50000 → Needed for connecting agents (workers)

-v jenkins_home:/var/jenkins_home → persistent storage for Jenkins data


2. http://localhost:8080
3. ```bash docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword```

4. Enter name and select Pipeline as project type
5. Add pipeline graph plugin
6. add node and copy the secret from the node
7. create a worker node
### Docker image
-----------
```bash
FROM jenkins/agent:latest-jdk17

USER root

# Install required tools
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Add NodeSource repo and install Node.js (example: Node 18)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN java -version && node -v && npm -v

USER jenkins
--------
```
### run this iamge
```bash
docker run -d --name jenkins-agent-node --network jenkins-net  
  jenkins-agent-node  
  java -jar /usr/share/jenkins/agent.jar  
  -url http://jenkins-controller:8080/  
  -secret 993ac21af6947f497de9e586a4cd8160ee0c20752023c4db92bd308e3daca7c3  
  -name "trackit-node"  
  -workDir "/home/jenkins"
```
Now the Node Will Start working
```bash
pipeline {
    agent {label 'trackit-node'}

    stages {
        stage('Hello') {
            steps {
                echo 'Hello World'
            }
        }
    }
```
}

