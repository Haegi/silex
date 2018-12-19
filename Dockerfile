#!/bin/bash
FROM resin/rpi-raspbian

RUN sudo apt-get update && sudo apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
RUN sudo apt-get update && sudo apt-get install -y nodejs

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
