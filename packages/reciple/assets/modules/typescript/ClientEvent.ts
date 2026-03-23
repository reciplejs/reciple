import { ClientEventModule } from "reciple";

// @ts-expect-error
export class $MODULE_NAME$ extends ClientEventModule<'$EVENT_NAME$'> {
    public event = '$EVENT_NAME$' as const;
    // @ts-expect-error
    public once = $EVENT_ONCE$;

    public onEvent(): void {
        // Write your code here
    }
}

export default new $MODULE_NAME$();
