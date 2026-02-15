import { Client, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } from 'discord.js';

export async function registerNotifyCommand(client: Client) {
  const commands = [
    new SlashCommandBuilder()
      .setName('notify_new_server')
      .setDescription('Notify all users about server migration')
      .addStringOption(option =>
        option
          .setName('invite_link')
          .setDescription('The invite link to the new server')
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        client.user!.id,
        process.env.DISCORD_GUILD_ID!
      ),
      { body: commands }
    );
  } catch (error) {
    console.error('Error registering notify_new_server command:', error);
  }
}