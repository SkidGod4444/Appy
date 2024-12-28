import {
  ChannelType,
  Client,
  EmbedBuilder,
  Guild,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { ColorResolvable } from "discord.js";
import { log_error, log_guild } from "../../configs/loggers";

export default async function handleBotJoin(
  client: Client & {
    config: { owner: string[]; prefix: string };
    default_color: ColorResolvable;
  },
): Promise<void> {
  client.on("guildCreate", async (guild: Guild) => {
    try {
      const systemChannel = guild.systemChannel as TextChannel | null;

      if (systemChannel) {
        const owner = await guild.fetchOwner();
        if (owner) {
          systemChannel.send(
            `Hello, <@${owner.id}>! Thanks for inviting me to **${guild.name}**! \n If you need any help, feel free to use the **${client.config.prefix}help** command.`,
          );
        }
      }

      console.log(`Bot joined the guild: ${guild.name}`);

      const inviteChannel =
        systemChannel ||
        guild.channels.cache.find(
          (channel) =>
            channel.type === ChannelType.GuildText ||
            channel.type === ChannelType.GuildVoice,
        );

      if (
        inviteChannel &&
        (inviteChannel instanceof TextChannel ||
          inviteChannel instanceof VoiceChannel)
      ) {
        inviteChannel
          .createInvite({ maxAge: 0, maxUses: 0 })
          .then((invite) => {
            log_guild.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(`#2f3136`)
                  .setTitle(`Bot joined a new guild!`)
                  .setDescription(`Bot joined the guild: **${guild.name}**`)
                  .addFields(
                    {
                      name: "Guild ID",
                      value: guild.id.toString(),
                      inline: false,
                    },
                    {
                      name: "Guild Owner ID",
                      value: guild.ownerId.toString(),
                      inline: false,
                    },
                    { name: "Invite Link", value: invite.url, inline: false },
                    {
                      name: "Total Guild Members",
                      value: guild.memberCount.toString(),
                      inline: false,
                    },
                  ),
              ],
            });
          })
          .catch((err) => {
            log_error.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(`#2f3136`)
                  .setTitle(`Failed to create invite for guild ${guild.name}`)
                  .setDescription(`Error: ${err}`),
              ],
            });
          });
      } else {
        log_error.send({
          embeds: [
            new EmbedBuilder()
              .setColor(`#2f3136`)
              .setTitle(
                `No valid channel found for creating invite in guild ${guild.name}`,
              ),
          ],
        });
      }
    } catch (error) {
      console.error(`Error handling guildCreate event:`, error);
      log_error.send({
        embeds: [
          new EmbedBuilder()
            .setColor(`#2f3136`)
            .setDescription(`\`\`\`ts\n${error}\`\`\``),
        ],
      });
    }
  });
}