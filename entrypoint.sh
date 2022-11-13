#!/usr/bin/env bash


[ ! -f "$CONFIG_FILE" ] && echo "copying example config" && cp config.yaml.example "$CONFIG_FILE"


[ ! -f "$KEY_FILE" ] && ssh-keygen -b 2048 -t rsa -f "$KEY_FILE" -q -N ""

node src/bot.js
