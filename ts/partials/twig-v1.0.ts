import { twig, extendFunction, extendTag } from 'twig';

interface Template {
    (data?: Object): string;
}

export default class View {
    public static ext: string = 'html.twig';
    
    public static render(template: Template, data?: Object) {
        return template(data);
    }
}