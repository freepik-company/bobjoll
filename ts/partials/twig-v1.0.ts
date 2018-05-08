import { twig, extendFunction, extendTag } from 'twig';

export default class View {
    public static ext: string = 'html.twig';
    
    public static render(template: Function, data?: Object) {
        return template(data);
    }
}