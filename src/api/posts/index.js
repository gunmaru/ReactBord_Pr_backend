//const Router = require('koa-router');
//const postsCtrl = require('./posts.ctrl');
//const { post } = require('..');
import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/checkLoggedln';

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn ,postsCtrl.write);


const post = new Router();
posts.get('/' , postsCtrl.read);
posts.delete('/',checkLoggedIn,postsCtrl.checkOwnPost , postsCtrl.remove);
posts.patch('/',checkLoggedIn, postsCtrl.checkOwnPost , postsCtrl.update);
// const post = new Router();
// post.get('/:id',postsCtrl.read);
// post.delete('/:id', postsCtrl.remove);
// post.patch('/:id', postsCtrl.update);

posts.use('/:id', postsCtrl.getPostById, post.routes());


export default posts;
//module.exports =posts;