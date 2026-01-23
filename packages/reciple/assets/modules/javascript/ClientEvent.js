// @ts-check
import { ClientEventModule } from "reciple";

export class $MODULE_NAME$ extends ClientEventModule {
    event = '$EVENT_NAME$';
    // @ts-expect-error
    once = $EVENT_ONCE$;

    onEvent(...args) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
