#!/bin/bash
FROM balenalib/rpi-raspbian:stretch

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get dist-upgrade -y
RUN apt-get install wget
RUN wget https://nodejs.org/dist/v11.10.1/node-v11.10.1-linux-armv7l.tar.gz
RUN tar -xvf node-v11.10.1-linux-armv7l.tar.gz
RUN cd node-v11.10.1-linux-armv7l/ && sudo cp -R * /usr/local/ #attention copies also readme and other not required files
RUN cd ..
RUN sudo npm -v
RUN sudo node -v

ENV SILEX_VERSION 0.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN sudo npm config set registry https://registry.npmjs.org/
RUN sudo npm i
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# compile typescript code
RUN sudo npm run compile

EXPOSE 8080
CMD [ "npm", "start" ]