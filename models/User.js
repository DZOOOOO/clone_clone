module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {
        // 스키마 정의
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(100),
            // 이메일 체크
            validate: {
                isEmail: true
            },
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        charset: "utf8", // 한국어 설정
        collate: "utf8_general_ci", // 한국어 설정
        tableName: "User", // 테이블 이름
        timestamps: true, // createAt & updateAt 활성화
        paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    });

    User.associate = (db) => {
        // 유저는 여러 게시글을 작성할 수 있다.
        db.User.hasMany(db.Post, {
            foreignKey: {
                name: 'fk_user_id',
                // 로그인 안된 상태에서는 게시글 작성이 불가능하다.
                allowNull: false
            },
            // 유저가 삭제되면 게시글 같이 삭제된다.
            onDelete: 'cascade',
        })

        // 유저는 여러 댓글을 작성할 수 있다.
        db.User.hasMany(db.Comment, {
            foreignKey: {
                name: 'fk_user_id',
                // 로그인 안된 상태어세는 댓글 작성이 불가능하다.
                allowNull: false
            },
            // 유저가 삭제되면 댓글 같이 삭제된다.
            onDelete: 'cascade',
        })
    }
    return User
}