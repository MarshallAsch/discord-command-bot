# Discord Command Server
![GitHub branch checks state](https://img.shields.io/github/checks-status/MarshallAsch/discord-command-bot/main?style=plastic)
![Docker Image Size with architecture (latest by date/latest semver)](https://img.shields.io/docker/image-size/marshallasch/discord-command-bot?style=plastic)



Managing a server is hard, you need a computer, your need to ssh into it and that is a pain.
This bot will help you solve that problem.
The discord command bot will let you configure a set of discord commands that can be used to run real commands on a host.
This is useful if I want to be able to easily pull new docker images for the docker-compose deployment, or if I want to reboot the server quickly from discord.


## Usage

This discord bot is designed to be deployed once per server that you want to manage (I currently have one host so that's what I made it for, it might change in the future to support multiple).
The first step is to create a configuration file that can be used to tell the bot what commands you want to be able to use, and who can run them.
There is more information later on the configuration file.

Once the set of commands has been configured, the host must be configured to allow ssh connections from the bot.
Make sure that:
- the configured user can ssh into the host
- the ssh key that will be used has been added to the authorized keys file
- the user has adequate permissions to run all the commands on the host
- there is not a firewall rule that will prevent the connection to the host


## Create the discord bot and add it to your server

This bot is designed to be hosted yourself using your own discord bot.

To create a discord bot:
1. Open the [Discord developer portal](https://discord.com/developers/applications) and log into your account.
2. Click on the "New Application" button.
3. Enter a name and confirm the pop-up window by clicking the "Create" button.
4. Edit your application's name, description, and avatar here. Once you've saved your changes, move on by selecting the "Bot" tab in the left pane.
5. Click the "Add Bot" button on the right and confirm the pop-up window by clicking "Yes, do it!".
6. Click the reset token button, (keep this for later and make sure that you keep this safe and secret)
7. Get the bots clientId, keep this for later

There you now have your discord bot created.
Next up, add it to your discord server, and deploy the command bot

### Install the bot
You can add the bot to your sever by using this URL `https://discord.com/api/oauth2/authorize?client_id=<insert your client ID here>&permissions=0&scope=bot%20applications.commands`.
You will need to set the client ID to the one for your app that you got from step 7.
Select the server you want to add it to and your all set.


### Deployment
The command bot has been designed to be deployed as a docker image, probably as a larger docker compose project.

1. Make sure that your `config.yaml` file is in the `./config` directory
2. make sure that your ssh token is in `/config/id_rsa` (although the path / name can be changed using the `KEY_FILE` environment variable). If they key does not exist it will be generated on the first run.

```bash
docker run -d -v './config:/config' \
   -e DISCORD_TOKEN='your discord bot token' \
   -e DISCORD_CLIENT_ID='your discord bot client id' \
   marshallasch/discord-command-bot
```

## Configuration file.

sample:
```yaml
reload_time: 5m
connection:
  username: marshall
  host: myhost.local
  privateKeyFile: /path/to/ssh/key
commands:
  - name: space
    description: Check the amount of free space
    command: df -h /mnt/plex
    allowed_users:
      - 1234567890
    blocked_users: []
  - name: ls
    description: list the files
    command: ls ~/homelab
    blocked_users:
      - 0987654321
```

#### reload_time (optional)
This is an optional field that can be used to tell the bot that it should periodically check the config file and auto reload it.
A duration string must be used ie. `1m`, `2h`
The minimum duration for reloading is 5 minutes, and it must not be more than 24 hours due to limitations of the JavaScript timer functions.
If the value is not set then the config file will not be reloaded.


#### connection
This block is used to configure the host that the commands should be run on.
The options that can be specified here can be found in the [ssh2-promise](https://www.npmjs.com/package/ssh2-promise) connection documentation.
The special field `privateKeyFile` can be used to specify an absolute file path to the ssh private key that should be used.
If it is not set then the `KEY_FILE` environment variable will be used as the source of the ssh key file.


#### commands
This is a list of command objects that will be configured as discord commands.

##### name
The name of the command that will be installed in discord.

##### description (optional)
An optional short message about what the command does, if this is not set it will default to 'runs a command on the host'.

##### command
The actual command that will be run on the remote host

##### allowed_users (optional)
An optional list of discord userIds of users who are allowed to use this command.
If it is not set then all users that are not on the blocked list can use the command.

##### blocked_users (optional)
An optional list of discord userIds of users who are not allowed to use this command.
Any user who is in this list will not be able to use the command.


