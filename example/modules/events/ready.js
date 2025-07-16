import { Module } from 'reciple';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ReadyEvent extends Module {
  static {
    __name(this, "ReadyEvent");
  }
  async onEnable({ client }) {
    client.on("ready", () => client.logger);
  }
}
var ready_default = new ReadyEvent();

export { ReadyEvent, ready_default as default };
//# sourceMappingURL=ready.js.map
//# sourceMappingURL=ready.js.map