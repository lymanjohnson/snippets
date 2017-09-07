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
    unique: true
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

snippetSchema.methods.findSnippetsFromSameAuthor = function(callback) {
    return this.model('Snippet').find({
        author: this.author,
        _id: {
            $ne: this._id
        }
    }, callback);
}

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    prepTime: {
        type: Number,
        min: [1, 'Prep time must be greater than 0']
    },
    cookTime: {
        type: Number,
        min: [1, 'Cook time must be greater than 0']
    },
    // cookMethod: {   type: String,   enum: ["oven", "microwave", "stovetop"] },
    ingredients: [
        {
            amount: {
                type: Number,
                required: true,
                default: 1
            },
            measure: {
                type: String,
                lowercase: true,
                trim: true
            },
            ingredient: {
                type: String,
                required: true
            }
        }
    ],
    steps: [String],
    source: {
        type: String
    }
})


recipeSchema.methods.findRecipesFromSameSource = function(callback) {
    return this.model('Recipe').find({
        source: this.source,
        _id: {
            $ne: this._id
        }
    }, callback);
}

const Recipe = mongoose.model('Recipe', recipeSchema);
const User = mongoose.model('User', userSchema);
const Snippet = mongoose.model('Snippet', snippetSchema);

/* FORMAT IS LIKE THIS:
const ModelName = mongoose.model('SingularizedCapitalizedCollectionName',modelSchema);
*/

module.exports = {
    User: User,
    Recipe: Recipe,
    Snippet: Snippet
};
