const { Client, Attachment } = require('discord.js');
const ytdl = require('ytdl-core');
const axios = require('axios')

const botSettings = require('../../botsettings.json');

const client = new Client();
const validUrlRegex = new RegExp(
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
);
const servers = {};

const play = async (connection, msg, server) => {
  const curr = server.queue.shift();
  server.dispatcher = connection.play(ytdl(curr, { filter: 'audioonly' }));
  server.dispatcher.on('end', () => {
    if (server.queue[0]) {
      play(connection, msg, server);
    } else {
      server.dispatcher.destroy();
    }
  });
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.generateInvite(['ADMINISTRATOR']).then(link => {
    console.log(link);
  });
});

client.on('message', async msg => {
  try {
    const { content, author } = msg;
    const [command, arg] = content.split('-');
    console.log(command, arg);
    switch (command) {
      case 'play':
        if (!arg) {
          msg.reply('You need a youtube url to play a song!');
        } else if (arg.match(validUrlRegex)) {
          if (!msg.member.voice) {
            msg.channel.send('You need to be in a voice channel to play!');
            return;
          }
          if (!servers[msg.guild.id]) {
            servers[msg.guild.id] = {
              queue: []
            };
          }
          const server = servers[msg.guild.id];
          server.queue.push(arg);
          console.log(server.queue);
          const connection = await msg.member.voice.channel.join();
          play(connection, msg, server);
        }
        return;
      case 'stop':
        const server = servers[msg.guild.id];
        console.log(server);
        server.dispatcher.destroy();
        server[msg.guild.id] = { queue: [] };
        console.log(server);
        return
      case 'joke':
        const {data} = await axios.get('https://api.jokes.one/jod?category=animal')
        console.log(data.contents.jokes[0].joke)
        const [qus, ans] =data.contents.jokes[0].joke.text.split('A:')
        msg.channel.send(qus)
        setTimeout(() => msg.channel.send(ans), 2500)
    }
  } catch (err) {
    console.error(err);
  }
});

client.login(botSettings.token);

const getVideo = async (url, msg) => {
  msg.send(`Preparing ${args[1]} for play.`);
};
