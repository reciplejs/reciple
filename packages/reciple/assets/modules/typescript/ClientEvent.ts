import { ClientEventModule } from "reciple";

// @ts-expect-error
export class $MODULE_NAME$ extends ClientEventModule<'$EVENT_NAME$'> {
    // @ts-expect-error
    event = '$EVENT_NAME$';
    // @ts-expect-error
    once = $EVENT_ONCE$;

    onEvent(...args) {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
