const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  }
});

userSchema.virtual('password')
  .get(function() {
    return null
  })
  .set(function(value) {
    const hash = bcrypt.hashSync(value, 8);
    this.passwordHash = hash;
  })

userSchema.methods.authenticate = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

userSchema.statics.authenticate = function(username, password, done) {
  this.findOne({
    username: username
  }, function(err, user) {
    if (err) {
      done(err, false)
    } else if (user && user.authenticate(password)) {
      done(null, user)
    } else {
      done(null, false)
    }
  })
};

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },

  tags: [String],

  author: {
    type: String,
    required: true
  },

  stars: [String] // list of usernames that starred it

});

snippetSchema
  .virtual('numberOfStars')
  .get(function() {
    return this.stars.length;
  });

snippetSchema.methods.findSnippetsFromSameAuthor = function(callback) {
  return this.model('Snippet').find({
    author: this.author,
    _id: {
      $ne: this._id
    }
  }, callback);
}


const User = mongoose.model('User', userSchema);
const Snippet = mongoose.model('Snippet', snippetSchema);

/* FORMAT IS LIKE THIS:
const ModelName = mongoose.model('SingularizedCapitalizedCollectionName',modelSchema);
*/

module.exports = {
  User: User,
  Snippet: Snippet
};