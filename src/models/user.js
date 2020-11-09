import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
//import { function } from '@hapi/joi';
import jwt from 'jsonwebtoken'

const UserSchema = new Schema({
    username :String,
    hashedPassword : String,

});

//인스턴스 메서드 만들기
UserSchema.methods.setPassword = async function(password){
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;
};
//인스턴스 메서드  작성할때는  화살표 함수가 아닌 funtion 키워드를 사용하여 구현해야함 내부함수에서 this에 접근해야하기 때문
UserSchema.methods.checkPassword = async function(password){
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result;
};

//스테틱 메서드
UserSchema.statics.findByUsername = function(username){
     return this.findOne({username});
};

UserSchema.methods.serialize = function(){
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
};

UserSchema.methods.generateToken = function() {
    //첫번째  파라미터에는 토큰안에 집어 넣고싶은 데이터를 넣습니다.
    const token = jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        process.env.JWT_SECRET, //두번째 파라미터에는 JWT 암호를 넣습니다.
        {
            expiresIn:'7d', //3일동안 유효함
        },
    );
    return token;

};


const User =  mongoose.model('User', UserSchema);
export default User;
