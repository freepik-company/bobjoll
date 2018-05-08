require('BobjollTemplate/helpers.js');

export default class View {
    public static ext: string = 'html.hbs';

    public static render(template: Function, data?: Object) {
        return template(data);
    }
}