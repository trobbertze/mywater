module.exports = {
  include: [
    {
      src: '{{SRC}}/assets/',
      dest: '{{WWW}}/assets/'
    },
    {
      src: '{{SRC}}/index.html',
      dest: '{{WWW}}/index.html'
    },
    {
      src: '{{SRC}}/manifest.json',
      dest: '{{WWW}}/manifest.json'
    },
    {
      src: '{{SRC}}/service-worker.js',
      dest: '{{WWW}}/service-worker.js'
    },
    {
      src: 'node_modules/ionic-angular/polyfills/polyfills.js',
      dest: '{{BUILD}}/polyfills.js'
    },
    {
      src: 'node_modules/ionicons/dist/fonts/',
      dest: '{{WWW}}/assets/fonts/'
    },
    {
      src: 'node_modules/chart.js/dist/Chart.js',
      dest: '{{WWW}}/libs/Chart.js'
    },
    {
      src: 'node_modules/moment/min/moment.min.js',
      dest: '{{WWW}}/libs/moment.js'
    },
    {
      src: 'node_modules/intl/dist/intl.min.js',
      dest: '{{WWW}}/libs/intl.min.js'
    },
    {
      src: 'node_modules/intl/locale-data/jsonp/en.js',
      dest: '{{WWW}}/libs/en.js'
    }
  ]
};
