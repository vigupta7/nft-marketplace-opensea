module.exports = (sequielize, DataTypes) => {

    const itemSchema = sequielize.define('item',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                minlength: [3, 'Name must be 3 characters or more'],
                maxlength: [255, "Name can't exceed 255 characters"],
                unique: [true, 'Name already exists. Please try a different name'],
                required: [true, 'Name is required'],
            },
            description: {
                type: DataTypes.STRING,
                maxlength: [1000, "Description can't exceed 1000 characters"]
            },
            external_link: {
                type: DataTypes.STRING,
            },
            media: {
                type: DataTypes.STRING,
            },
            thumb: {
                type: DataTypes.STRING,
            },
            has_offer: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            attributes: DataTypes.STRING,
            levels: DataTypes.STRING,
            stats: DataTypes.STRING,
            unlock_content_url: {
                type: DataTypes.STRING,
                defaultValue: ""
            },
            view_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            like_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            price: {
                type: DataTypes.REAL,
                defaultValue: 0
            },
            stauts: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            token_id: {
                type: DataTypes.STRING,
                defaultValue: ""
            },
            category_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'categories',
                    key: 'id'
                }
            },
            collection_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'collections',
                    key: 'id'
                }
            },
            current_owner: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            author_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            status: {
                type: DataTypes.STRING,
                enum: ['active', 'inactive'],
                defaultValue: 'inactive'
            },
            minted_date: {
                type: DataTypes.DATE,
            },
            created_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        }); 

    return itemSchema;
};