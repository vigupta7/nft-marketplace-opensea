module.exports = (sequielize, DataTypes) => {

    const Category = sequielize.define('category',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            category_image: {
                type: DataTypes.STRING
            },
            status: {
                type: DataTypes.STRING
            },
            create_date: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });

    return Category;
};