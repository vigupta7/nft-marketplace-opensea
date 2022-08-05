module.exports = (sequielize, DataTypes) => {

    const historySchema = sequielize.define('history',
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
            collection_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'collections',
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
            transaction_hash: {
                type: DataTypes.STRING
            },
            price: {
                type: DataTypes.REAL
            },
            history_type: {
                type: DataTypes.STRING,
                enum: ['minted', 'bids', 'transfer', 'comission', 'admin_comission']
            },
            is_valid: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            created_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });

    return historySchema;
};