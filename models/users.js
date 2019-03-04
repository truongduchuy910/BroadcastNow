// app/models/user.js
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    verifyCode: String,
    PSID: String,
    first_name: String,
    last_name: String,
    profile_pic: String,
    listCreate: [],
    listFollow: [],
    listBoardcast: []
});

// Các phương thức ======================
// Tạo mã hóa mật khẩu
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// kiểm tra mật khẩu có trùng khớp
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


module.exports = mongoose.model('user', userSchema);