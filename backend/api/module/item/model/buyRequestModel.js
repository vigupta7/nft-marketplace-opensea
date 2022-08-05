module.exports = (sequielize, DataTypes) => {

    const buyRequestSchema = sequielize.define('buy_request',
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
            from_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            to_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            price: {
                type: DataTypes.REAL
            },
            tx_hash: {
                type: DataTypes.STRING
            },
            sign: {
                type: DataTypes.STRING
            },
            status: {
                type: DataTypes.STRING,
                enum: ['PENDING', 'REJECT', 'SUBMIT', 'SUCCESS', 'FAILED']
            },
            created: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });

    return buyRequestSchema;
};