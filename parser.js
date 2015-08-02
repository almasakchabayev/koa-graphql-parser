import getRawBody from 'raw-body'

function graphqlBodyParser(options = {}) {
  let onerror = options.onerror;
  options.onerror = undefined;

  return function *(next) {
    try {
      yield* parse(this, options);
    } catch (err) {
      if(onerror) {
        onerror(err, this);
      } else {
        throw err;
      }
    }

    yield next;
  };

  function *parse(ctx, options) {

    //check for content length
    if (ctx.headers['content-length']) {
      options.length = ctx.length;
    } else {
      let message = 'The request did not specify the length of its content, which is required';
      let err = new Error(message);
      err.status = 411;
      throw err;
    }

    //finish options
    options.encoding = options.encoding || 'utf8';
    options.limit = options.limit || '1mb';

    //get content type
    let type = ctx.headers['content-type'] || '';
    type = type.split(';')[0];

    if('application/graphql' == type) {
      ctx.request.body = yield getRawBody(ctx.req, options);
    } else {
      let message = type ? 'Unsupported content-type: ' + type : 'Missing content-type';
      let err = new Error(message);
      err.status = 415;
      throw err;
    }

  }
}


export default graphqlBodyParser;