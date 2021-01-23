FROM node:15.6.0-stretch

VOLUME /config
WORKDIR /app
RUN apt-get update && apt-get install wakeonlan

ADD * /app/

RUN npm ci

ENTRYPOINT ./start.sh
