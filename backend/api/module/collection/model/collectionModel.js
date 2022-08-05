module.exports = (sequielize, DataTypes) => {

    const Collection = sequielize.define('collection',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                unique: [true, 'Name already exists. Please try a different name'],
                required: [true, 'Name is required'],
                validate: {
                    len: {
                        args: [3, 100],
                        msg: "Name must be 3 characters or more"
                    }
                }
            },
            description: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 1000],
                        msg: "Description can't exceed 1000 characters"
                    }
                }
            },
            contract_symbol: {
                type: DataTypes.STRING
            },
            contract_address: {
                type: DataTypes.STRING
            },
            banner: {
                type: DataTypes.STRING
            },
            image: {
                type: DataTypes.STRING
            },
            royalties: {
                type: DataTypes.REAL,
                defaultValue: 0
            },
            volume_traded: {
                type: DataTypes.REAL,
                defaultValue: 0
            },
            item_count: {
                type: DataTypes.REAL,
                defaultValue: 0
            },
            status: {
                type: DataTypes.TINYINT,
                enum: [0, 1],
                defaultValue: 1
            },
            author_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            create_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });

    // Collection.associate = models => {
    //     Collection.hasMany(models.itemSchema, {
    //       foreignKey: 'collection_id'
    //     });
    //   };

    return Collection;
};