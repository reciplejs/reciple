import { ClientEventModule } from "reciple";

// @ts-expect-error
export class $MODULE_NAME$ extends ClientEventModule<'$EVENT_NAME$'> {
    event = '$EVENT_NAME$' as const;
    // @ts-expect-error
    once = $EVENT_ONCE$;

    onEvent() {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
