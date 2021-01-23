#!/usr/bin/env bash


# This script will start a docker container running a minecraft server
# on a remote machine and turn it on if neccisary
#

HOST=ip
MAC=mac

IS_UP=$(ping -c 3 -nq  $HOST >/dev/null; echo "$?") # if up this will be 0


if [[ $IS_UP -ne 0 ]]; then
    echo "Remote host is down"
    wakeonlan $MAC
    sleep 15 # give it 15 seconds for the machine to powerup
fi

ping -c 3 -nq  $HOST
ssh -o StrictHostKeyChecking=no -i /config/id_rsa user@$HOST 'docker start minecraft'
