import { ClientEventModule } from 'reciple';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ReadyEvent extends ClientEventModule {
  static {
    __name(this, "ReadyEvent");
  }
  event = "ready";
  async onEvent(client) {
    this.client.logger.log("Ready!");
  }
}
var ready_default = new ReadyEvent();

export { ReadyEvent, ready_default as default };
//# sourceMappingURL=ready.js.map
//# sourceMappingURL=ready.js.map