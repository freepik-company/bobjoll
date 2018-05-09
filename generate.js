const fs = require('fs');
const dir = './icons';
const path = require('path');
const files = fs.readdirSync(dir);
const fontsGenerator = require('webfonts-generator');
const icons = files.reduce((acc, file) => {
    if ('.svg' === path.extname(file)) {
        acc.push(`${dir}/${file}`);
    }

    return acc;
}, []);

fontsGenerator({
    files: icons,
    dest: './fonts/',
    fontName: 'bobjoll',
    templateOptions: {
        classPrefix: '.icon--',
        baseSelector: '.icon'
    },
    cssDest: './scss/partials/_icon-v2-0.scss',
    cssTemplate: './fonts/webfontsGenerator.templates.scss.hbs',
    cssFontsUrl: '~bobjoll/fonts',
    types: ['woff', 'woff2'],
    order: ['woff2', 'woff']
}, function (error) {
    if (error) {
        console.log('Fail!', error);
    } else {
        console.log('Done!');
    }
});