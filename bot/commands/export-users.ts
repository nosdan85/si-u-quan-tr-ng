import { Client, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } from 'discord.js';

export async function registerCommands(client: Client) {
  const commands = [
    new SlashCommandBuilder()
      .setName('export_users')
      .setDescription('Export all linked Discord users')
      // Admin only
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
    console.error('Error registering export_users command:', error);
  }
}