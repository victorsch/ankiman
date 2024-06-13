import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';
import Word from './Word.js';

const Query = sequelize.define('Query', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Query.belongsTo(User);
User.hasMany(Query);

Query.hasMany(Word);
Word.belongsTo(Query);

export default Query;
