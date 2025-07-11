export class NotAnError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotAnError';
    }
}
