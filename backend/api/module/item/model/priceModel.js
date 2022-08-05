module.exports = (sequielize, DataTypes) => {

    const priceSchema = sequielize.define('prices',
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
            price: {
                type: DataTypes.REAL,
                defaultValue: 0
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
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

    return priceSchema;
};