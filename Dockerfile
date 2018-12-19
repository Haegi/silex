#!/bin/bash
FROM resin/raspberrypi3-debian:stretch

RUN sudo apt-get update && sudo apt-get install nodejs npm
RUN sudo npm install -g npm@latest
RUN npm -v

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
