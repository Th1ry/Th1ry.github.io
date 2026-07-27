const Hexo = require('hexo');

const hexo = new Hexo(process.cwd(), {});

hexo.init()
  .then(() => hexo.call('generate', { watch: false }))
  .then(() => hexo.exit())
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
