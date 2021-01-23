#!/usr/bin/env bash





[ ! -d "/config/startscripts" ] && mkdir /config/startscripts

[ -z $DISCORD_TOKEN ] && echo "DISCORD_TOKEN must be set, exiting. " && exit -1

[ ! -f "/config/config.yml" ] && echo "copying example config" && cp config.yml /config/config.yml


[ ! -f "/config/id_rsa" ] && ssh-keygen -b 2048 -t rsa -f /config/id_rsa -q -N ""


eval `ssh-agent -s`
ssh-add /config/id_rsa

node bot.js
