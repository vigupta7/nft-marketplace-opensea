var bcrypt = require('bcrypt');

module.exports = (sequielize, DataTypes) => {

    const userSchema = sequielize.define('user',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            username: {
                type: DataTypes.STRING,
                minlength: [1, 'User Name must be 1 characters or more'],
                maxlength: [32, "User Name can't exceed 32 characters"]
                // validate: {
                //     isAlpha: {
                //       msg: "UserName  must be alphabetic",
                //     },
                //   }
                //validate: [validator.isAlpha, 'UserName  must be alphabetic'],
            },
            email: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
            },
            first_name: {
                type: DataTypes.STRING,
                maxlength: [32, "First Name can't exceed 32 characters"],
                required: false,
            },
            last_name: {
                type: DataTypes.STRING,
                maxlength: [32, "Last name can't exceed 32 characters"],
                required: false,
            },
            dob: DataTypes.STRING,
            phone: {
                type: DataTypes.STRING,
            },
            profile_image: DataTypes.STRING,
            profile_cover: DataTypes.STRING,
            metamask_info_id: DataTypes.STRING,
            metamask_info_type: DataTypes.STRING,
            role: { type: DataTypes.TINYINT, defaultValue: 2 },
            is_notification: { type: DataTypes.TINYINT, defaultValue: 1 },
            is_featured: { type: DataTypes.TINYINT, defaultValue: 0 },
            status: {
                type: DataTypes.STRING,
                enum: ['active', 'inactive', 'blocked', 'reset']
            },
            create_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });


    userSchema.beforeValidate(async (user, options) => {
        //var user = next;
        if (!user.changed('password')) {
            return;
        }
        if (user.password.length == 0) {
            return;
        }
        // generate a salt        
        bcrypt.genSalt(12, function (err, salt) {
            if (err) return;
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return;
                // override the cleartext password with the hashed one
                user.password = hash;
                return;
                //return sequelize.Promise.resolve(user)
            });
        });

    });


    userSchema.prototype.comparePassword = function (candidatePassword, cb) {
        // console.log("candidatePassword ",candidatePassword);
        // console.log("cb ",cb);

        const userPassword = this.getDataValue('password');
        bcrypt.compare(candidatePassword, userPassword, function (err, isMatch) {
            if (err) return cb(err);
            cb(null, (candidatePassword === userPassword));
        });
    };

    return userSchema;
};