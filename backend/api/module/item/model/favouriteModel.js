module.exports = (sequielize, DataTypes) => {

    const favouriteSchema = sequielize.define('favourites',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            item_id: { 
                type: DataTypes.INTEGER,
                references: {
                    model: 'items',
                    key: 'id'
                }
            },
            user_id: { 
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            created_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });

    return favouriteSchema;
};
