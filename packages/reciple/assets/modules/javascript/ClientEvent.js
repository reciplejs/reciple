// @ts-check
import { ClientEventModule } from "reciple";

// @ts-expect-error
export class $MODULE_NAME$ extends ClientEventModule {
    event = '$EVENT_NAME$';
    // @ts-expect-error
    once = $EVENT_ONCE$;

    // @ts-expect-error
    onEvent(...args) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
