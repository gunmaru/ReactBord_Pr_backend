//const { post } = require(".");
import Post from '../../models/post'
import mongoose from 'mongoose';
import Joi, { object } from '@hapi/joi';
import posts from './index';

const {ObjectId} = mongoose.Types;

// export const checkObjectId = (ctx, next) =>{
//     const {id} = ctx.params;
//     if(!ObjectId.isValid(id)){
//         ctx.status = 400;
//         return;
//     } 
//     return next();
// }

export const getPostById = async(ctx, next) =>{
    const {id} = ctx.params;
    if(!ObjectId.isValid(id)){
        ctx.status = 400;
        return;
    }
    try{
        const post = await Post.findById(id);
        if(!post){
            ctx.status = 404;
            return;

        }
        ctx.state.post = post;
        return next();
    }catch(e){
        ctx.throw(500, e);
    }

};


//포스트 작성
export const write = async ctx =>{

    const schema = Joi.object().keys({
        title: Joi.string().required(), //required가 있으면 필수항목
        body:Joi.string().required(),
        tags: Joi.array()
        .items(Joi.string())
        .required(), //문자열로 이루어진 배열

    });

    const result = schema.validate(ctx.request.body);
    if(result.error){
        ctx.status=400; //BAD request
        ctx.body =result.error;
        return;
    }


    const {title, body, tags} = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
        user: ctx.state.user,
    });
    try{
        await post.save();
        ctx.body =post;
    }catch(e){
        ctx.throw(500,e);
    }
};

//포스트 조회
export const list = async ctx =>{
    const page =parseInt(ctx.query.page || '1', 10);
    if(page < 1){
        ctx.status = 400;
        return;
    }

const{tag, username} = ctx.query;
// tag, username 값이 유효하면 객체안에 넣고, 그렇지 않으면 넣지않음
const query = {
    ...(username ? {'user.username': username}: {}),
    ...(tag ?{tags : tag}:{}),
};


    try{
        const posts = await Post.find(query)
        .sort({_id:-1})
        .limit(10)
        .skip((page - 1) * 10) 
        .exec();
        const postCount = await Post.countDocuments(query).exec();
        ctx.set('Last-Page', Math.ceil(postCount/10));
        ctx.body = posts.map(post => ({
            ...post,
            body:
            post.body.length < 22 ? post.body : `${post.body.slice(0,22)}...`,
        }));


        //ctx.body =posts;
    }
    catch(e)
    {
        ctx.throw(500, e);
    }
};



// export const read = async ctx =>{
//     const{id} =ctx.params;
//     try{
//         const post = await Post.findById(id).exec();
//         if(!post){
//             ctx.status =404;
//             return;
//         }   
//         ctx.body = post;
//     }
//     catch(e){
//         ctx.throw(500, e);
//     }
// };
export const read = ctx => {
    ctx.body = ctx.state.post;
}


export const checkOwnPost = (ctx, next) => {
    const {user, post} =ctx.state;
    if(post.user._id.toString() !== user._id){
        ctx.status = 403;
        return;
    }
    return next();
};


//특정포스트 제거
export const remove = async ctx =>{
    const{id} =ctx.params;
    try{
        await Post.findByIdAndRemove(id).exec();
        ctx.status =204;

    }
    catch(e){
        ctx.throw(500,e);
    }
};

//포스트 수정
export const update = async ctx =>{
    const{id} = ctx.params;

    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags:Joi.array().items(Joi.string()),
    });

    //검증하고 나서 검증 실패인 경우 에러 처리
    const result = schema.validate(ctx.request.body);
    if(result.error){
        ctx.status =400;
        ctx.body =result.error;
        return;
    }

    try{
        const post = await Post.findByIdAndUpdate(id, ctx.request.body,{
            new: true,

        }).exec();
        if(!post)
        {
            ctx.status=404;
            return;
        }
        ctx.body =post;
    }
    catch(e){
        ctx.throw(500,e);
    }
};