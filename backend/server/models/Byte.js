const mongoose = require('mongoose');

const ByteSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Please add a summary'],
      trim: true,
      validate: {
        validator: function(v) {
          return v.length >= 100 && v.length <= 200;
        },
        message: 'Summary must be between 100 and 200 characters'
      }
    },
    example: {
      type: String,
      required: [true, 'Please add an example'],
      trim: true,
      validate: {
        validator: function(v) {
          return v.length >= 100 && v.length <= 200;
        },
        message: 'Example must be between 100 and 200 characters'
      }
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    datePublished: {
      type: Date,
      default: Date.now,
    },
    quiz: {
      question: {
        type: String,
        required: [true, 'Please add a quiz question'],
      },
      options: {
        type: [String],
        required: [true, 'Please add quiz options'],
        validate: {
          validator: function(v) {
            return v.length >= 2 && v.length <= 4;
          },
          message: 'Quiz must have between 2 and 4 options'
        }
      },
      correctAnswer: {
        type: String,
        required: [true, 'Please add the correct answer'],
        validate: {
          validator: function(v) {
            return this.quiz.options.includes(v);
          },
          message: 'Correct answer must be one of the options'
        }
      },
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Byte', ByteSchema);
