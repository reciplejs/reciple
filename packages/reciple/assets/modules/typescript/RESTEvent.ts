import { RESTEventModule } from "reciple";

// @ts-expect-error
export class $MODULE_NAME$ extends RESTEventModule<'$EVENT_NAME$'> {
    event: '$EVENT_NAME$' = '$EVENT_NAME$';
    // @ts-expect-error
    once = $EVENT_ONCE$;

    onEvent() {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
