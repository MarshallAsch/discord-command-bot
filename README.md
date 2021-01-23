# Discord command server


Running a Minecraft server for my discord group is great when I run it on my computer, but it requires that
the computer is always on. Since I don't want to do that and having to ask someone to turn it on all the time
is frustrating I created this discord bot.


The purpose of this bot is to run on a different device in my house (one that is already running 24/7) so that it
can turn on the computer that runs Minecraft and start the server without me having to press any buttons.

Add the discord bot to your discord server, and when you send a message in the form of `!run <some text>`
the bot will see if the `<some text>` is a task it is supposed to run a script on.

For me the script involves checking if the computer is on, and power it on if necessary,
and then ssh into the computer and start the server. (an example script can be found in the [/startscripts] folder).


This discord bot has been packaged into a Docker container that can be found [here](https://hub.docker.com/r/marshallasch/discord-command-bot), and is run as the following:

```bash
$ docker run -d -v config:/config -e DISCORD_TOKEN=<some token> marshallasch/discord-command-bot
```

The first time the container is run the config folder will be generated with a `startscripts` folder,
a sample `config.yml` file, as well as an ssh keypair (it will not be generated if it already exists).

The scripts are bash scripts that are run from within the container.
