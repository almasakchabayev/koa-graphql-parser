import request from 'supertest';
import koa from 'koa';
import should from 'should'
import graphqlBodyParser from '../';

describe('test graphql body parser middleware', function () {
  let app;
  beforeEach(function () {
    app = koa();
  });
  it('should parse graphql body of get request ok', function (done) {
    app.use(graphqlBodyParser());
    app.use(function *() {
      this.request.body.should.eql('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}');
      this.body = this.request.body;
    });
    request(app.listen())
      .get('/')
      .set('Content-Type', 'application/graphql')
      .send('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}')
      .expect('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}', done);
  });
  it('should parse graphql body of post request ok', function (done) {
    app.use(graphqlBodyParser());
    app.use(function *() {
      this.request.body.should.eql('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}');
      this.body = this.request.body;
    });
    request(app.listen())
      .post('/')
      .set('Content-Type', 'application/graphql')
      .send('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}')
      .expect('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}', done);
  });
  it('should return unsupported type if application/graphql is not specified for get request', function (done) {
    app.use(graphqlBodyParser());
    request(app.listen())
      .get('/')
      .send('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}')
      .expect(415, done);
  });
  it('should return unsupported type if application/graphql is not specified for post request', function (done) {
    app.use(graphqlBodyParser());
    request(app.listen())
      .post('/')
      .send('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}')
      .expect(415, done);
  });
  it('should fail if graphql body exceed limit size for get request', function (done) {
    app.use(graphqlBodyParser({
      limit: 1
    }));
    request(app.listen())
      .get('/')
      .set('Content-Type', 'application/graphql')
      .send('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}')
      .expect(413, done);
  });
  it('should fail if graphql body exceed limit size for post request', function (done) {
    app.use(graphqlBodyParser({
      limit: 1
    }));
    request(app.listen())
      .post('/')
      .set('Content-Type', 'application/graphql')
      .send('{foo(id:e63ea405-3aac-4933-9fcc-4f29a7f22a31){bar}')
      .expect(413, done);
  });
  it('should fail if no body is sent with get request', function (done) {
    app.use(graphqlBodyParser());
    request(app.listen())
      .get('/')
      .set('Content-Type', 'application/graphql')
      .send()
      .expect(411, done);
  });
  it('should fail if no body is sent with post request', function (done) {
    app.use(graphqlBodyParser());
    request(app.listen())
      .post('/')
      .set('Content-Type', 'application/graphql')
      .send()
      .expect(411, done);
  });
  it('should get custom error message with get request', function (done) {
    app.use(graphqlBodyParser({
      onerror: function (err, ctx) {
        ctx.throw('custom parse error', 422);
      }
    }));
    request(app.listen())
      .get('/')
      .expect(422)
      .expect('custom parse error', done);
  })
});