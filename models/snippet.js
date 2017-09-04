const mongoose = require('mongoose');

/*

a title
a body (the code)
optional notes
a language
tags -- that is, user-defined words or phrases that classify the code, like "authentication", "front-end", "middleware", or "database".

*/


const snippetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    body: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    tags: [String],
    author: {
        type: String
    }

    // prepTime: {
    //     type: Number,
    //     min: [1, 'Prep time must be greater than 0']
    // },
    // cookTime: {
    //     type: Number,
    //     min: [1, 'Cook time must be greater than 0']
    // },
    // cookMethod: {   type: String,   enum: ["oven", "microwave", "stovetop"] },
    // ingredients: [
    //     {
    //         amount: {
    //             type: Number,
    //             required: true,
    //             default: 1
    //         },
    //         measure: {
    //             type: String,
    //             lowercase: true,
    //             trim: true
    //         },
    //         ingredient: {
    //             type: String,
    //             required: true
    //         }
    //     }
    // ],

})

snippetSchema.methods.findSnippetsFromSameSource = function(callback) {
    return this.model('Snippet').find({
        source: this.source,
        _id: {
            $ne: this._id
        }
    }, callback);
}

snippetSchema.methods.getFormData = function() {
    const error = this.validateSync();
    let errors;
    if (error) {
        errors = error.errors;
    } else {
        errors = {};
    }

    const fields = [
        {
            name: 'name',
            label: 'Name'
        }, {
            name: 'source',
            label: 'Source'
        }, {
            name: 'prepTime',
            label: 'Prep time'
        }, {
            name: 'cookTime',
            label: 'Cook time'
        }
    ]

    fields.forEach(function(field) {
        field.value = this[field.name];
        field.error = errors[field.name];
    }.bind(this));

    let ingredients = {
      name: 'ingredients',
      label: 'Ingredients',
      nested: []
    };

    for (let idx = 0; idx < this.ingredients.length; idx++) {
      ingredients.nested[idx] = [
        {
          nestedname: 'amount',
          nestedlabel: 'Amount',
          index: idx,
          value: this.ingredients[idx].amount,
          error: errors[`ingredients.${idx}.amount`]
        },
        {
          nestedname: 'measure',
          nestedlabel: 'Measure',
          index: idx,
          value: this.ingredients[idx].measure,
          error: errors[`ingredients.${idx}.measure`]
        },
        {
          nestedname: 'ingredient',
          nestedlabel: 'Ingredient',
          index: idx,
          value: this.ingredients[idx].ingredient,
          error: errors[`ingredients.${idx}.ingredient`]
        }
      ]
    }

    fields.push(ingredients);

    return fields;
}

const Snippet = mongoose.model('Snippet', snippetSchema);

module.exports = Snippet;
