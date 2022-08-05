module.exports = (sequielize, DataTypes) => {

    const Option = sequielize.define('option',
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
                required: [true, 'Settings name is required'],
            },
            value: {
                type: DataTypes.STRING,
                defaultValue: ''
            }
        },
        {
            timestamps: false  // do not create updatedAt createdAt colums
        });

    return Option;
};