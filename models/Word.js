import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';

const Word = sequelize.define('Word', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  definition: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  example: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

Word.belongsTo(User);
User.hasMany(Word);

export default Word;
