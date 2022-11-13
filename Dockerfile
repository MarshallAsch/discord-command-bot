FROM node:18.0-bullseye

LABEL org.opencontainers.version="v1.0.0"

LABEL org.opencontainers.image.authors="Marshall Asch <maasch@rogers.com> (https://marshallasch.ca)"
LABEL org.opencontainers.image.url="https://github.com/MarshallAsch/discord-command-bot.git"
LABEL org.opencontainers.image.source="https://github.com/MarshallAsch/discord-command-bot.git"
LABEL org.opencontainers.image.licenses="GPL-2.0-only"
LABEL org.opencontainers.image.title="command-bot"
LABEL org.opencontainers.image.description="A Discord bot that can ssh into another host to run commands"

VOLUME /config
WORKDIR /usr/src/app

ENTRYPOINT /entrypoint.sh

ENV NODE_ENV=production
ENV CONFIG_FILE="/config/config.yaml"
ENV KEY_FILE="/config/id_ed25519"

RUN apt-get update && apt-get install wakeonlan

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts=true

COPY entrypoint.sh /entrypoint.sh
COPY . .

# these two labels will change every time the container is built
# put them at the end because of layer caching
ARG VCS_REF='unknown'
ENV VCS_REF=$VCS_REF
LABEL org.opencontainers.image.revision="${VCS_REF}"

ARG BUILD_DATE
LABEL org.opencontainers.image.created="${BUILD_DATE}"