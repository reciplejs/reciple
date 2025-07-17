import { MessageCommandModule, MessageCommandBuilder } from 'reciple';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class PingCommand extends MessageCommandModule {
  static {
    __name(this, "PingCommand");
  }
  data = new MessageCommandBuilder().setName("ping").setDescription("Pong!").setAliases("pong").toJSON();
  /**
   * 
   * @param {MessageCommand.ExecuteData} data 
   */
  async execute(data) {
    data.message.reply("Pong!");
  }
}
var ping_default = new PingCommand();

export { PingCommand, ping_default as default };
//# sourceMappingURL=ping.js.map
//# sourceMappingURL=ping.js.map