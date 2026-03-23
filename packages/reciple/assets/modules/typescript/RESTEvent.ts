import { RESTEventModule } from "reciple";

// @ts-expect-error
export class $MODULE_NAME$ extends RESTEventModule<'$EVENT_NAME$'> {
    public event: '$EVENT_NAME$' = '$EVENT_NAME$';
    // @ts-expect-error
    public once = $EVENT_ONCE$;

    public onEvent(): void {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
