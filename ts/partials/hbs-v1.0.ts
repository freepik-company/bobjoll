require('BobjollTemplate/helpers.js');

interface Template {
    (data?: Object): string;
}

export default class View {
    public static ext: string = 'html.hbs';

    public static render(template: Template, data?: Object) {
        return template(data);
    }
}