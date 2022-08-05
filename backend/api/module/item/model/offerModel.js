module.exports = (sequielize, DataTypes) => {

    const offerSchema = sequielize.define('offer',
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
            sender: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            receiver: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            price: {
                type: DataTypes.REAL
            },
            status: {
                type: DataTypes.STRING,
                enum: ['pending', 'accepted']
            },
            created_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });

    return offerSchema;
};