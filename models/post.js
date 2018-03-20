module.exports = function (sequelize, DataTypes) {
    var Post = sequelize.define("Post", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        body: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3 - 140]
            }
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pictureUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        groupLimit: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        capacity: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        authorEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2]
            }
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        classMethods: {
            associate: function (models) {
                Post.belongsToMany(models.User, {
                    through: models.UserPost
                });
            }
        }
    }, {
        timestamps: true
    });
    return Post;
};